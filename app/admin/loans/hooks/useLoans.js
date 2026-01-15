import { useCallback, useEffect, useMemo, useState } from 'react';
import { loansAPI } from '@/lib/api/loans';
import { useToast } from '@/components/ToastProvider';

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mapLoanToCard(loan) {
  const equipment = loan.equipment;
  const user = loan.user;
  const image =
    equipment?.gambar && equipment.gambar.startsWith('/')
      ? equipment.gambar
      : equipment?.gambar
        ? `/uploads/${equipment.gambar}`
        : null;

  return {
    id: loan.id,
    status: loan.status,
    jumlah: loan.jumlah,
    tanggal_pinjam: formatDate(loan.tanggal_pinjam),
    tanggal_deadline: formatDate(loan.tanggal_deadline),
    tanggal_kembali: formatDate(loan.tanggal_kembali),
    tanggal_ambil: formatDate(loan.tanggal_ambil),
    approved_at: formatDate(loan.approved_at),
    rejection_reason: loan.rejection_reason,
    keterangan: loan.keterangan,
    peminjam: {
      id: user?.id,
      name: `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || '—',
      email: user?.email || '—',
    },
    product: {
      id: equipment?.id,
      name: equipment?.nama || '—',
      type: equipment?.kategori?.nama || 'Lainnya',
      image,
      kode_alat: equipment?.kode_alat || null,
    },
    approver: loan.approver
      ? `${loan.approver.first_name ?? ''} ${loan.approver.last_name ?? ''}`.trim()
      : null,
    rejecter: loan.rejecter
      ? `${loan.rejecter.first_name ?? ''} ${loan.rejecter.last_name ?? ''}`.trim()
      : null,
  };
}

export function useLoans() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [loansRaw, setLoansRaw] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL | PENDING | APPROVED | BORROWED | RETURNED | REJECTED | OVERDUE

  const loadLoans = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'ALL') {
        params.status = filterStatus;
      }
      const res = await loansAPI.getAll(params);
      if (res.success) {
        setLoansRaw(res.data || []);
      } else {
        toast.error(res.error || 'Gagal memuat data peminjaman');
      }
    } catch (e) {
      console.error('Error fetching loans:', e);
      toast.error('Gagal memuat data peminjaman');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, toast]);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const loans = useMemo(() => loansRaw.map(mapLoanToCard), [loansRaw]);

  // Filter by search term
  const filteredLoans = useMemo(() => {
    if (!searchTerm.trim()) return loans;

    const searchLower = searchTerm.toLowerCase();
    return loans.filter((loan) => {
      return (
        loan.peminjam.name.toLowerCase().includes(searchLower) ||
        loan.peminjam.email.toLowerCase().includes(searchLower) ||
        loan.product.name.toLowerCase().includes(searchLower) ||
        loan.product.kode_alat?.toLowerCase().includes(searchLower) ||
        loan.product.type.toLowerCase().includes(searchLower)
      );
    });
  }, [loans, searchTerm]);

  const counts = useMemo(() => {
    const c = {
      ALL: loans.length,
      PENDING: 0,
      APPROVED: 0,
      BORROWED: 0,
      RETURNED: 0,
      REJECTED: 0,
      OVERDUE: 0,
    };
    loans.forEach((l) => {
      if (l.status) {
        c[l.status] = (c[l.status] || 0) + 1;
      }
    });
    return c;
  }, [loans]);

  return {
    loans: filteredLoans,
    loading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    counts,
    refetch: loadLoans,
  };
}


