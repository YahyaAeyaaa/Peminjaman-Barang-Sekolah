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

function mapLoanToDetail(loan) {
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
          foto_bukti: ret.foto_bukti,
          kondisi_alat: ret.kondisi_alat,
          catatan: ret.catatan,
        }
      : null,
    jumlah: loan.jumlah,
    tanggal_pinjam: loan.tanggal_pinjam,
    tanggal_deadline: loan.tanggal_deadline,
    tanggal_kembali: loan.tanggal_kembali,
    tanggal_ambil: loan.tanggal_ambil,
    approved_at: loan.approved_at,
    rejection_reason: loan.rejection_reason,
    keterangan: loan.keterangan,
    peminjam: loan.user
      ? {
          id: loan.user.id,
          name: `${loan.user.first_name ?? ''} ${loan.user.last_name ?? ''}`.trim(),
          email: loan.user.email,
        }
      : null,
    product: {
      id: equipment?.id,
      name: equipment?.nama,
      type: equipment?.kategori?.nama || 'Lainnya',
      description: equipment?.deskripsi || 'Tidak ada deskripsi',
      image,
      stock: equipment?.stok ?? 0,
      kode_alat: equipment?.kode_alat || null,
    },
    labels: {
      tanggal_pinjam: formatDate(loan.tanggal_pinjam),
      tanggal_deadline: formatDate(loan.tanggal_deadline),
      tanggal_kembali: formatDate(loan.tanggal_kembali),
      tanggal_ambil: formatDate(loan.tanggal_ambil),
      approved_at: formatDate(loan.approved_at),
    },
  };
}

export function useLoanDetail(loanId) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [loanRaw, setLoanRaw] = useState(null);

  const fetchDetail = useCallback(async () => {
    if (!loanId) return;
    try {
      setLoading(true);
      const res = await loansAPI.getById(loanId);
      if (res.success) {
        setLoanRaw(res.data);
      } else {
        toast.error(res.error || 'Gagal memuat detail peminjaman');
      }
    } catch (e) {
      console.error('Error fetching loan detail:', e);
      toast.error('Gagal memuat detail peminjaman');
    } finally {
      setLoading(false);
    }
  }, [loanId, toast]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const loan = useMemo(() => (loanRaw ? mapLoanToDetail(loanRaw) : null), [loanRaw]);

  return { loan, loading, refetch: fetchDetail };
}


