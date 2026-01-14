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

function mapReturnToUI(ret) {
  const loan = ret.loan;
  const equipment = loan?.equipment;
  const user = loan?.user || ret.returner;

  return {
    id: ret.id,
    loan_id: ret.loan_id,
    status: ret.status,
    tanggal_kembali: ret.tanggal_kembali,
    tanggal_kembali_label: formatDate(ret.tanggal_kembali),
    kondisi_alat: ret.kondisi_alat,
    catatan: ret.catatan,
    foto_bukti: ret.foto_bukti,
    denda_telat: Number(ret.denda_telat || 0),
    denda_kerusakan: Number(ret.denda_kerusakan || 0),
    total_denda: Number(ret.total_denda || 0),
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
    },
  };
}

export function useReturnsApproval() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState('MENUNGGU_PEMBAYARAN'); // MENUNGGU_PEMBAYARAN | DIKEMBALIKAN
  const [returnsRaw, setReturnsRaw] = useState([]);

  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmPayment, setConfirmPayment] = useState(false);

  const returnsList = useMemo(() => returnsRaw.map(mapReturnToUI), [returnsRaw]);

  const loadReturns = useCallback(async (tab = activeTab) => {
    try {
      setLoading(true);
      const res = await returnsAPI.getAll({ status: tab });
      if (res.success) {
        setReturnsRaw(res.data || []);
      } else {
        toast.error(res.error || 'Gagal memuat data pengembalian');
      }
    } catch (e) {
      console.error('Error loading returns:', e);
      toast.error('Gagal memuat data pengembalian');
    } finally {
      setLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => {
    loadReturns(activeTab);
  }, [activeTab, loadReturns]);

  const openConfirm = (returnItem) => {
    setSelectedReturn(returnItem);
    setConfirmPayment(false);
    setShowConfirmModal(true);
  };

  const closeModal = () => {
    setShowConfirmModal(false);
    setSelectedReturn(null);
    setConfirmPayment(false);
  };

  const confirmReturn = async () => {
    if (!selectedReturn) return;

    try {
      setSubmitting(true);
      const res = await returnsAPI.confirm(selectedReturn.id, { confirm_payment: confirmPayment });
      if (res.success) {
        toast.success('Berhasil', 'Pengembalian berhasil dikonfirmasi');
        closeModal();
        await loadReturns(activeTab);
      } else {
        toast.error(res.error || 'Gagal mengkonfirmasi pengembalian');
      }
    } catch (e) {
      console.error('Error confirming return:', e);
      toast.error(e.response?.data?.error || 'Gagal mengkonfirmasi pengembalian');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading,
    submitting,
    activeTab,
    setActiveTab,
    returnsList,
    selectedReturn,
    showConfirmModal,
    confirmPayment,
    setConfirmPayment,
    openConfirm,
    closeModal,
    confirmReturn,
  };
}


