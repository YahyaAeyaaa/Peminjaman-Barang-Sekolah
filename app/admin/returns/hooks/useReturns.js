import { useCallback, useEffect, useMemo, useState } from 'react';
import { returnsAPI } from '@/lib/api/returns';
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

function getKondisiLabel(kondisi) {
  const labels = {
    'BAIK': 'Baik',
    'RUSAK_RINGAN': 'Rusak Ringan',
    'RUSAK_SEDANG': 'Rusak Sedang',
    'RUSAK_BERAT': 'Rusak Berat',
    'HILANG': 'Hilang'
  };
  return labels[kondisi] || kondisi;
}

function getKondisiColor(kondisi) {
  const colors = {
    'BAIK': 'bg-green-50 text-green-700 border-green-200',
    'RUSAK_RINGAN': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'RUSAK_SEDANG': 'bg-orange-50 text-orange-700 border-orange-200',
    'RUSAK_BERAT': 'bg-red-50 text-red-700 border-red-200',
    'HILANG': 'bg-red-100 text-red-800 border-red-300'
  };
  return colors[kondisi] || 'bg-gray-50 text-gray-700 border-gray-200';
}

function mapReturnToCard(ret) {
  const loan = ret.loan;
  const equipment = loan?.equipment;
  const user = loan?.user || ret.returner;
  const image =
    equipment?.gambar && equipment.gambar.startsWith('/')
      ? equipment.gambar
      : equipment?.gambar
        ? `/uploads/${equipment.gambar}`
        : null;

  return {
    id: ret.id,
    loan_id: ret.loan_id,
    status: ret.status,
    tanggal_kembali: formatDate(ret.tanggal_kembali),
    kondisi_alat: ret.kondisi_alat,
    kondisi_label: getKondisiLabel(ret.kondisi_alat),
    kondisi_color: getKondisiColor(ret.kondisi_alat),
    catatan: ret.catatan,
    foto_bukti: ret.foto_bukti,
    denda_telat: Number(ret.denda_telat || 0),
    denda_kerusakan: Number(ret.denda_kerusakan || 0),
    total_denda: Number(ret.total_denda || 0),
    denda_dibayar: Number(ret.denda_dibayar || 0),
    confirmed_at: ret.confirmed_at ? formatDate(ret.confirmed_at) : null,
    peminjam: {
      id: user?.id,
      name: user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '—',
      email: user?.email || '—',
      kelas: user?.kelas || null,
    },
    equipment: {
      id: equipment?.id,
      name: equipment?.nama || '—',
      jumlah: loan?.jumlah || 0,
      image,
      kode_alat: equipment?.kode_alat || null,
      kategori: equipment?.kategori?.nama || 'Lainnya',
    },
    receiver: ret.receiver
      ? `${ret.receiver.first_name ?? ''} ${ret.receiver.last_name ?? ''}`.trim()
      : null,
  };
}

export function useReturns() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [returnsRaw, setReturnsRaw] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL | MENUNGGU_PEMBAYARAN | DIKEMBALIKAN

  const loadReturns = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch semua returns (tidak filter by status dulu, kita filter di client untuk mendapatkan total count)
      const res = await returnsAPI.getAll();
      if (res.success) {
        setReturnsRaw(res.data || []);
      } else {
        toast.error(res.error || 'Gagal memuat data pengembalian');
      }
    } catch (e) {
      console.error('Error fetching returns:', e);
      toast.error('Gagal memuat data pengembalian');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadReturns();
  }, [loadReturns]);

  const returns = useMemo(() => returnsRaw.map(mapReturnToCard), [returnsRaw]);

  // Filter by status
  const filteredByStatus = useMemo(() => {
    if (filterStatus === 'ALL') return returns;
    return returns.filter((ret) => ret.status === filterStatus);
  }, [returns, filterStatus]);

  // Filter by search term
  const filteredReturns = useMemo(() => {
    if (!searchTerm.trim()) return filteredByStatus;

    const searchLower = searchTerm.toLowerCase();
    return filteredByStatus.filter((ret) => {
      return (
        ret.peminjam.name.toLowerCase().includes(searchLower) ||
        ret.peminjam.email.toLowerCase().includes(searchLower) ||
        ret.equipment.name.toLowerCase().includes(searchLower) ||
        ret.equipment.kode_alat?.toLowerCase().includes(searchLower) ||
        ret.equipment.kategori.toLowerCase().includes(searchLower)
      );
    });
  }, [filteredByStatus, searchTerm]);

  const counts = useMemo(() => {
    const c = {
      ALL: returns.length,
      MENUNGGU_PEMBAYARAN: 0,
      DIKEMBALIKAN: 0,
    };
    returns.forEach((r) => {
      if (r.status === 'MENUNGGU_PEMBAYARAN') {
        c.MENUNGGU_PEMBAYARAN += 1;
      } else if (r.status === 'DIKEMBALIKAN') {
        c.DIKEMBALIKAN += 1;
      }
    });
    return c;
  }, [returns]);

  const totalDenda = useMemo(() => {
    return returns.reduce((sum, r) => sum + r.total_denda, 0);
  }, [returns]);

  const totalDendaDibayar = useMemo(() => {
    return returns.reduce((sum, r) => sum + r.denda_dibayar, 0);
  }, [returns]);

  return {
    returns: filteredReturns,
    loading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    counts,
    totalDenda,
    totalDendaDibayar,
    refetch: loadReturns,
  };
}


