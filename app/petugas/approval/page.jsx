'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import { Clock, CheckCircle, XCircle, Package, User, Calendar, FileText, AlertCircle } from 'lucide-react';

export default function ApprovalPage() {
  const router = useRouter();
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showConfirmTakeModal, setShowConfirmTakeModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPendingLoans();
  }, []);

  const loadPendingLoans = () => {
    // Ambil data dari localStorage (dalam real app, ini dari API)
    const allPeminjaman = JSON.parse(localStorage.getItem('peminjaman') || '[]');
    
    // Filter yang status PENDING atau APPROVED (belum diambil)
    const pending = allPeminjaman.filter(p => 
      p.status === 'MENUNGGU_APPROVAL' || 
      p.status === 'PENDING' || 
      p.status === 'APPROVED' ||
      p.status === 'DISETUJUI'
    );
    
    setPendingLoans(pending);
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleApprove = async () => {
    if (!selectedLoan) return;
    
    setSubmitting(true);
    
    // Simulasi API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update status di localStorage
    const allPeminjaman = JSON.parse(localStorage.getItem('peminjaman') || '[]');
    const updated = allPeminjaman.map(p => 
      p.id === selectedLoan.id 
        ? { 
            ...p, 
            status: 'APPROVED',
            approved_at: new Date().toISOString(),
            approved_by: 'petugas-1' // Mock petugas ID
          }
        : p
    );
    localStorage.setItem('peminjaman', JSON.stringify(updated));
    
    setSubmitting(false);
    setShowApproveModal(false);
    setSelectedLoan(null);
    loadPendingLoans();
  };

  const handleReject = async () => {
    if (!selectedLoan || !rejectReason.trim()) return;
    
    setSubmitting(true);
    
    // Simulasi API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update status di localStorage
    const allPeminjaman = JSON.parse(localStorage.getItem('peminjaman') || '[]');
    const updated = allPeminjaman.map(p => 
      p.id === selectedLoan.id 
        ? { 
            ...p, 
            status: 'REJECTED',
            rejected_at: new Date().toISOString(),
            rejected_by: 'petugas-1',
            rejection_reason: rejectReason
          }
        : p
    );
    localStorage.setItem('peminjaman', JSON.stringify(updated));
    
    setSubmitting(false);
    setShowRejectModal(false);
    setSelectedLoan(null);
    setRejectReason('');
    loadPendingLoans();
  };

  const handleConfirmTake = async () => {
    if (!selectedLoan) return;
    
    setSubmitting(true);
    
    // Simulasi API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update status di localStorage
    const allPeminjaman = JSON.parse(localStorage.getItem('peminjaman') || '[]');
    const updated = allPeminjaman.map(p => 
      p.id === selectedLoan.id 
        ? { 
            ...p, 
            status: 'BORROWED',
            tanggal_ambil: new Date().toISOString()
          }
        : p
    );
    localStorage.setItem('peminjaman', JSON.stringify(updated));
    
    setSubmitting(false);
    setShowConfirmTakeModal(false);
    setSelectedLoan(null);
    loadPendingLoans();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500 font-semibold">
            Petugas • Approval
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Menyetujui Peminjaman
          </h1>
          <p className="text-base text-gray-600 max-w-3xl">
            Review dan setujui atau tolak pengajuan peminjaman baru dari peminjam.
          </p>
        </header>

        {/* Info jumlah */}
        {pendingLoans.length > 0 && (
          <div className="text-sm text-gray-500">
            Menampilkan <span className="font-semibold text-gray-700">{pendingLoans.length}</span> pengajuan menunggu persetujuan
          </div>
        )}

        {/* Grid peminjaman */}
        {pendingLoans.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                <CheckCircle className="text-gray-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Tidak ada pengajuan pending
                </h3>
                <p className="text-sm text-gray-600">
                  Semua pengajuan peminjaman sudah diproses.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pendingLoans.map((loan) => {
              const product = loan.product;
              
              return (
                <div
                  key={loan.id}
                  className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1"
                >
                  {/* Image Section */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                          <p className="text-sm text-gray-500 font-medium">{product.type}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {(loan.status === 'MENUNGGU_APPROVAL' || loan.status === 'PENDING') ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold bg-amber-50 text-amber-700 border-amber-200 backdrop-blur-sm bg-white/95">
                          <Clock size={14} />
                          <span>Menunggu Approval</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 backdrop-blur-sm bg-white/95">
                          <CheckCircle size={14} />
                          <span>Disetujui</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 space-y-4">
                    {/* Title */}
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold mb-1">
                        {product.type}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {product.name}
                      </h3>
                    </div>

                    {/* Info Peminjaman */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User size={16} className="text-gray-400" />
                        <span>
                          Peminjam: <span className="font-semibold text-gray-900">User</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package size={16} className="text-gray-400" />
                        <span>
                          Jumlah: <span className="font-semibold text-gray-900">{loan.jumlah} unit</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        <span>
                          Deadline: <span className="font-semibold text-gray-900">{formatDate(loan.estimasiKembali)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Alasan */}
                    {loan.alasan && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-[0.1em] font-semibold mb-1">
                          Alasan
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {loan.alasan}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                      {(loan.status === 'MENUNGGU_APPROVAL' || loan.status === 'PENDING') ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLoan(loan);
                              setShowRejectModal(true);
                            }}
                          >
                            <XCircle size={14} className="mr-1" />
                            Tolak
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            bgColor="#161b33"
                            hoverColor="#111628"
                            className="flex-1 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLoan(loan);
                              setShowApproveModal(true);
                            }}
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Setujui
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          bgColor="#161b33"
                          hoverColor="#111628"
                          fullWidth
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLoan(loan);
                            setShowConfirmTakeModal(true);
                          }}
                        >
                          <Package size={14} className="mr-1" />
                          Konfirmasi Barang Diambil
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>

      {/* Modal Approve */}
      {showApproveModal && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Setujui Peminjaman
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Konfirmasi untuk menyetujui pengajuan peminjaman ini
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Detail Peminjaman */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold text-gray-900">Barang:</span> {selectedLoan.product.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-gray-900">Jumlah:</span> {selectedLoan.jumlah} unit
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-gray-900">Deadline Pengembalian:</span> {formatDate(selectedLoan.estimasiKembali)}
                  </p>
                  {selectedLoan.alasan && (
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900">Alasan:</span> {selectedLoan.alasan}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <AlertCircle size={16} className="inline mr-2" />
                    Setelah disetujui, peminjam akan diberi waktu 3 hari untuk mengambil barang. Stok akan dikurangi setelah barang diambil.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedLoan(null);
                }}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                bgColor="#161b33"
                hoverColor="#111628"
                onClick={handleApprove}
                loading={submitting}
              >
                Setujui Peminjaman
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reject */}
      {showRejectModal && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Tolak Peminjaman
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Berikan alasan penolakan untuk pengajuan peminjaman ini
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Detail Peminjaman */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-semibold text-gray-900">Barang:</span> {selectedLoan.product.name}
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-gray-900">Jumlah:</span> {selectedLoan.jumlah} unit
                </p>
              </div>

              {/* Alasan Penolakan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Jelaskan alasan penolakan..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#161b33] focus:border-transparent"
                  required
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Alasan penolakan akan dikirim ke peminjam
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedLoan(null);
                  setRejectReason('');
                }}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                loading={submitting}
                disabled={!rejectReason.trim()}
              >
                Tolak Peminjaman
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Pengambilan */}
      {showConfirmTakeModal && selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Konfirmasi Barang Diambil
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Konfirmasi bahwa peminjam sudah mengambil barang fisik
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Detail Peminjaman */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold text-gray-900">Barang:</span> {selectedLoan.product.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-gray-900">Jumlah:</span> {selectedLoan.jumlah} unit
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-gray-900">Peminjam:</span> User
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-gray-900">Deadline Pengembalian:</span> {formatDate(selectedLoan.estimasiKembali)}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <AlertCircle size={16} className="inline mr-2" />
                    Setelah dikonfirmasi, status akan berubah menjadi "Sedang Dipinjam" dan stok akan dikurangi.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmTakeModal(false);
                  setSelectedLoan(null);
                }}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                bgColor="#161b33"
                hoverColor="#111628"
                onClick={handleConfirmTake}
                loading={submitting}
              >
                Konfirmasi Barang Diambil
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

