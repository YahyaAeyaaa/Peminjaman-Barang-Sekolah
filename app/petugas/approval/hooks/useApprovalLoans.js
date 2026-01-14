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

function mapLoanToUI(loan) {
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
    tanggal_deadline: loan.tanggal_deadline,
    tanggal_deadline_label: formatDate(loan.tanggal_deadline),
    keterangan: loan.keterangan,
    approved_at: loan.approved_at,
    tanggal_ambil: loan.tanggal_ambil,
    rejection_reason: loan.rejection_reason,
    product: {
      id: equipment?.id,
      name: equipment?.nama,
      type: equipment?.kategori?.nama || 'Lainnya',
      description: equipment?.deskripsi || 'Tidak ada deskripsi',
      image,
      stock: equipment?.stok ?? 0,
    },
    peminjam: {
      id: user?.id,
      name: user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '—',
      email: user?.email || '—',
    },
  };
}

export function useApprovalLoans() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loansRaw, setLoansRaw] = useState([]);
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING | APPROVED

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showConfirmTakeModal, setShowConfirmTakeModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const pendingLoans = useMemo(() => loansRaw.map(mapLoanToUI), [loansRaw]);

  const loadApprovalLoans = useCallback(async (tab = activeTab) => {
    try {
      setLoading(true);
      // Fetch sesuai tab:
      // - PENDING: request baru
      // - APPROVED: sudah disetujui, menunggu peminjam datang untuk ambil barang (petugas confirm take)
      const status = tab === 'APPROVED' ? 'APPROVED' : 'PENDING';
      const res = await loansAPI.getAll({ status });
      if (!res.success) throw new Error(res.error || 'Gagal memuat data approval');

      setLoansRaw(res.data || []);
    } catch (e) {
      console.error('Error loading pending loans:', e);
      toast.error('Gagal memuat data approval');
    } finally {
      setLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => {
    loadApprovalLoans(activeTab);
  }, [activeTab, loadApprovalLoans]);

  const counts = useMemo(() => {
    // counts ini dihitung dari fetch sesuai tab (simple)
    return {
      PENDING: activeTab === 'PENDING' ? pendingLoans.length : undefined,
      APPROVED: activeTab === 'APPROVED' ? pendingLoans.length : undefined,
    };
  }, [activeTab, pendingLoans.length]);

  const openApprove = (loan) => {
    setSelectedLoan(loan);
    setShowApproveModal(true);
  };

  const openReject = (loan) => {
    setSelectedLoan(loan);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const openConfirmTake = (loan) => {
    setSelectedLoan(loan);
    setShowConfirmTakeModal(true);
  };

  const closeAllModals = () => {
    setShowApproveModal(false);
    setShowRejectModal(false);
    setShowConfirmTakeModal(false);
    setSelectedLoan(null);
    setRejectReason('');
  };

  const handleApprove = async () => {
    if (!selectedLoan) return;
    try {
      setSubmitting(true);
      const res = await loansAPI.approve(selectedLoan.id);
      if (res.success) {
        toast.success('Disetujui', 'Peminjaman berhasil disetujui');
        closeAllModals();
        // Setelah approve, pindah tab APPROVED supaya card tidak "hilang"
        setActiveTab('APPROVED');
        await loadApprovalLoans('APPROVED');
      } else {
        toast.error(res.error || 'Gagal menyetujui peminjaman');
      }
    } catch (e) {
      console.error('Error approving loan:', e);
      toast.error(e.response?.data?.error || 'Gagal menyetujui peminjaman');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedLoan) return;
    if (!rejectReason.trim()) return;

    try {
      setSubmitting(true);
      const res = await loansAPI.reject(selectedLoan.id, rejectReason.trim());
      if (res.success) {
        toast.success('Ditolak', 'Peminjaman berhasil ditolak');
        closeAllModals();
        await loadApprovalLoans('PENDING');
      } else {
        toast.error(res.error || 'Gagal menolak peminjaman');
      }
    } catch (e) {
      console.error('Error rejecting loan:', e);
      toast.error(e.response?.data?.error || 'Gagal menolak peminjaman');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmTake = async () => {
    if (!selectedLoan) return;
    try {
      setSubmitting(true);
      const res = await loansAPI.confirmTake(selectedLoan.id);
      if (res.success) {
        toast.success('Dikonfirmasi', 'Barang berhasil dikonfirmasi sudah diambil');
        closeAllModals();
        // Setelah confirm take, loan keluar dari tab APPROVED karena jadi BORROWED
        await loadApprovalLoans('APPROVED');
      } else {
        toast.error(res.error || 'Gagal konfirmasi pengambilan');
      }
    } catch (e) {
      console.error('Error confirm take:', e);
      toast.error(e.response?.data?.error || 'Gagal konfirmasi pengambilan');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading,
    submitting,
    pendingLoans,
    selectedLoan,
    showApproveModal,
    showRejectModal,
    showConfirmTakeModal,
    rejectReason,
    setRejectReason,
    activeTab,
    setActiveTab,
    counts,
    loadApprovalLoans,
    openApprove,
    openReject,
    openConfirmTake,
    closeAllModals,
    handleApprove,
    handleReject,
    handleConfirmTake,
  };
}


