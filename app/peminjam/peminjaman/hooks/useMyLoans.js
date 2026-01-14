import { useCallback, useEffect, useMemo, useState } from 'react';
import { loansAPI } from '@/lib/api/loans';
import { useToast } from '@/components/ToastProvider';

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function mapLoanToCard(loan) {
  const equipment = loan.equipment;
  const ret = loan.return || null;
  const image =
    equipment?.gambar && equipment.gambar.startsWith('/')
      ? equipment.gambar
      : equipment?.gambar
        ? `/uploads/${equipment.gambar}`
        : null;

  return {
    id: loan.id,
    status: loan.status,
    return: ret
      ? {
          id: ret.id,
          status: ret.status,
          confirmed_at: ret.confirmed_at,
          total_denda: ret.total_denda,
        }
      : null,
    jumlah: loan.jumlah,
    tanggal_pinjam: loan.tanggal_pinjam,
    tanggal_deadline: loan.tanggal_deadline,
    tanggal_pinjam_label: formatDate(loan.tanggal_pinjam),
    tanggal_deadline_label: formatDate(loan.tanggal_deadline),
    keterangan: loan.keterangan,
    product: {
      id: equipment?.id,
      name: equipment?.nama,
      type: equipment?.kategori?.nama || 'Lainnya',
      description: equipment?.deskripsi || 'Tidak ada deskripsi',
      image,
      stock: equipment?.stok ?? 0,
    },
  };
}

export function useMyLoans() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [loansRaw, setLoansRaw] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL | PENDING | APPROVED | BORROWED

  const loadLoans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await loansAPI.getAll();
      if (res.success) {
        setLoansRaw(res.data || []);
      } else {
        toast.error(res.error || 'Gagal memuat data peminjaman');
      }
    } catch (e) {
      console.error('Error fetching my loans:', e);
      toast.error('Gagal memuat data peminjaman');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const loans = useMemo(() => loansRaw.map(mapLoanToCard), [loansRaw]);

  const counts = useMemo(() => {
    const c = { ALL: loans.length, PENDING: 0, APPROVED: 0, BORROWED: 0 };
    loans.forEach((l) => {
      if (l.status === 'PENDING') c.PENDING += 1;
      if (l.status === 'APPROVED') c.APPROVED += 1;
      if (l.status === 'BORROWED') c.BORROWED += 1;
    });
    return c;
  }, [loans]);

  const visibleLoans = useMemo(() => {
    // Di halaman peminjaman aktif, kita tidak ingin menampilkan loan yang sudah masuk riwayat
    // (RETURNED & sudah dikonfirmasi) maupun yang sudah DITOLAK.
    const activeLoans = loans.filter(
      (l) =>
        !(
          (l.status === 'RETURNED' && l.return?.status === 'DIKEMBALIKAN') ||
          l.status === 'REJECTED'
        )
    );

    if (activeTab === 'ALL') return activeLoans;
    return activeLoans.filter((l) => l.status === activeTab);
  }, [activeTab, loans]);

  const historyLoans = useMemo(() => {
    // Masuk riwayat kalau:
    // - loan.status RETURNED dan return.status sudah DIKEMBALIKAN (petugas sudah konfirmasi)
    // - ATAU loan.status REJECTED (ditolak petugas)
    return loans.filter(
      (l) =>
        (l.status === 'RETURNED' && l.return?.status === 'DIKEMBALIKAN') ||
        l.status === 'REJECTED'
    );
  }, [loans]);

  return {
    loading,
    loans: visibleLoans,
    allLoans: loans,
    historyLoans,
    counts,
    activeTab,
    setActiveTab,
    refetch: loadLoans,
  };
}


