'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import { Clock, Package, User, Calendar, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

export default function PengembalianPage() {
  const router = useRouter();
  const [returnsList, setReturnsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmPayment, setConfirmPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Mock data - dalam real app, ini dari API
    const mockReturns = [
      {
        id: 'ret-001',
        loan_id: 'loan-001',
        peminjam: {
          name: 'John Doe',
          email: 'john@example.com',
          kelas: 'X-1 A'
        },
        equipment: {
          name: 'Laptop Dell Inspiron',
          jumlah: 1
        },
        tanggal_kembali: '2024-01-15T10:00:00Z',
        kondisi_alat: 'BAIK',
        catatan: 'Barang dalam kondisi baik',
        denda_telat: 0,
        denda_kerusakan: 0,
        total_denda: 0,
        status: 'MENUNGGU_PEMBAYARAN'
      },
      {
        id: 'ret-002',
        loan_id: 'loan-002',
        peminjam: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          kelas: 'X-2 B'
        },
        equipment: {
          name: 'Proyektor Epson',
          jumlah: 1
        },
        tanggal_kembali: '2024-01-16T14:30:00Z',
        kondisi_alat: 'RUSAK_RINGAN',
        catatan: 'Ada goresan kecil di bagian casing',
        denda_telat: 50000,
        denda_kerusakan: 150000,
        total_denda: 200000,
        status: 'MENUNGGU_PEMBAYARAN'
      }
    ];
    
    setReturnsList(mockReturns);
    setLoading(false);
  }, []);

  const getKondisiLabel = (kondisi) => {
    const labels = {
      'BAIK': 'Baik',
      'RUSAK_RINGAN': 'Rusak Ringan',
      'RUSAK_SEDANG': 'Rusak Sedang',
      'RUSAK_BERAT': 'Rusak Berat',
      'HILANG': 'Hilang'
    };
    return labels[kondisi] || kondisi;
  };

  const getKondisiColor = (kondisi) => {
    const colors = {
      'BAIK': 'bg-green-50 text-green-700 border-green-200',
      'RUSAK_RINGAN': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'RUSAK_SEDANG': 'bg-orange-50 text-orange-700 border-orange-200',
      'RUSAK_BERAT': 'bg-red-50 text-red-700 border-red-200',
      'HILANG': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[kondisi] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const handleConfirmReturn = (returnItem) => {
    setSelectedReturn(returnItem);
    setConfirmPayment(false);
    setShowConfirmModal(true);
  };

  const handleSubmitConfirm = async () => {
    if (selectedReturn.total_denda > 0 && !confirmPayment) {
      alert('Harap centang konfirmasi pembayaran jika ada denda!');
      return;
    }

    setSubmitting(true);
    
    // Simulasi API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update status loan menjadi DIKEMBALIKAN di localStorage
    const allPeminjaman = JSON.parse(localStorage.getItem('peminjaman') || '[]');
    const updated = allPeminjaman.map(p => 
      p.id === selectedReturn.loan_id 
        ? { 
            ...p, 
            status: 'DIKEMBALIKAN',
            confirmed_at: new Date().toISOString()
          }
        : p
    );
    localStorage.setItem('peminjaman', JSON.stringify(updated));
    
    setReturnsList(returnsList.filter(r => r.id !== selectedReturn.id));
    setShowConfirmModal(false);
    setSelectedReturn(null);
    setConfirmPayment(false);
    setSubmitting(false);
    alert('Pengembalian berhasil dikonfirmasi!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            Petugas • Pengembalian Barang
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Pengembalian Menunggu Konfirmasi
          </h1>
          <p className="text-base text-gray-600 max-w-3xl">
            Verifikasi dan konfirmasi pengembalian barang dari peminjam.
          </p>
        </header>

        {/* Info jumlah */}
        {returnsList.length > 0 && (
          <div className="text-sm text-gray-500">
            Menampilkan <span className="font-semibold text-gray-700">{returnsList.length}</span> pengembalian menunggu konfirmasi
          </div>
        )}

        {/* Grid pengembalian */}
        {returnsList.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                <CheckCircle className="text-gray-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Tidak ada pengembalian menunggu konfirmasi
                </h3>
                <p className="text-sm text-gray-600">
                  Semua pengembalian sudah dikonfirmasi.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {returnsList.map((returnItem) => (
              <div
                key={returnItem.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-300"
              >
                {/* Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-[0.1em] font-semibold mb-1">
                        ID Pengembalian
                      </p>
                      <p className="text-sm font-mono font-semibold text-gray-900">
                        {returnItem.id}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full border text-xs font-semibold ${getKondisiColor(returnItem.kondisi_alat)}`}>
                      {getKondisiLabel(returnItem.kondisi_alat)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Peminjam Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm">
                        <span className="font-semibold text-gray-900">{returnItem.peminjam.name}</span>
                        {returnItem.peminjam.kelas && (
                          <span className="text-gray-500"> • {returnItem.peminjam.kelas}</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package size={16} className="text-gray-400" />
                      <span className="text-sm">
                        {returnItem.equipment.name} ({returnItem.equipment.jumlah} unit)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm">
                        Dikembalikan: <span className="font-semibold text-gray-900">{formatDate(returnItem.tanggal_kembali)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Catatan */}
                  {returnItem.catatan && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-[0.1em] font-semibold mb-1">
                        Catatan
                      </p>
                      <p className="text-sm text-gray-700">{returnItem.catatan}</p>
                    </div>
                  )}

                  {/* Denda Info */}
                  {returnItem.total_denda > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={16} className="text-amber-600" />
                        <p className="text-xs font-semibold text-amber-900 uppercase tracking-[0.1em]">
                          Total Denda
                        </p>
                      </div>
                      <p className="text-lg font-bold text-amber-900">
                        Rp {returnItem.total_denda.toLocaleString('id-ID')}
                      </p>
                      {returnItem.denda_telat > 0 && (
                        <p className="text-xs text-amber-700 mt-1">
                          Denda telat: Rp {returnItem.denda_telat.toLocaleString('id-ID')}
                        </p>
                      )}
                      {returnItem.denda_kerusakan > 0 && (
                        <p className="text-xs text-amber-700">
                          Denda kerusakan: Rp {returnItem.denda_kerusakan.toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  )}

                  {returnItem.total_denda === 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        ✓ Tidak ada denda
                      </p>
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="p-5 border-t border-gray-100">
                  <Button
                    variant="primary"
                    bgColor="#161b33"
                    hoverColor="#111628"
                    fullWidth
                    onClick={() => handleConfirmReturn(returnItem)}
                  >
                    Konfirmasi Pengembalian
                  </Button>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* Modal Konfirmasi */}
      {showConfirmModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Konfirmasi Pengembalian
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Verifikasi informasi pengembalian sebelum mengkonfirmasi
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Detail Pengembalian */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-[0.1em] font-semibold mb-2">
                    Informasi Peminjam
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900">Nama:</span> {selectedReturn.peminjam.name}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900">Email:</span> {selectedReturn.peminjam.email}
                    </p>
                    {selectedReturn.peminjam.kelas && (
                      <p className="text-sm">
                        <span className="font-semibold text-gray-900">Kelas:</span> {selectedReturn.peminjam.kelas}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-[0.1em] font-semibold mb-2">
                    Informasi Barang
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900">Barang:</span> {selectedReturn.equipment.name}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900">Jumlah:</span> {selectedReturn.equipment.jumlah} unit
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900">Kondisi:</span>{' '}
                      <span className={`px-2 py-1 rounded-full border text-xs font-semibold ${getKondisiColor(selectedReturn.kondisi_alat)}`}>
                        {getKondisiLabel(selectedReturn.kondisi_alat)}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900">Tanggal Kembali:</span> {formatDate(selectedReturn.tanggal_kembali)}
                    </p>
                  </div>
                </div>

                {selectedReturn.catatan && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-[0.1em] font-semibold mb-2">
                      Catatan
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{selectedReturn.catatan}</p>
                    </div>
                  </div>
                )}

                {/* Denda */}
                {selectedReturn.total_denda > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-amber-900 uppercase tracking-[0.1em] mb-3">
                      Detail Denda
                    </p>
                    <div className="space-y-2 text-sm text-amber-800">
                      {selectedReturn.denda_telat > 0 && (
                        <div className="flex justify-between">
                          <span>Denda Keterlambatan:</span>
                          <span className="font-semibold">Rp {selectedReturn.denda_telat.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {selectedReturn.denda_kerusakan > 0 && (
                        <div className="flex justify-between">
                          <span>Denda Kerusakan:</span>
                          <span className="font-semibold">Rp {selectedReturn.denda_kerusakan.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-amber-300">
                        <span className="font-semibold">Total Denda:</span>
                        <span className="font-bold text-lg">Rp {selectedReturn.total_denda.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkbox Konfirmasi Pembayaran */}
              {selectedReturn.total_denda > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmPayment}
                      onChange={(e) => setConfirmPayment(e.target.checked)}
                      className="mt-1 w-5 h-5 text-[#161b33] border-gray-300 rounded focus:ring-[#161b33]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Saya konfirmasi pembayaran sudah lunas
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Pastikan pembayaran denda sudah diterima sebelum mengkonfirmasi pengembalian.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {selectedReturn.total_denda === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    ✓ Tidak ada denda. Langsung konfirmasi pengembalian.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedReturn(null);
                  setConfirmPayment(false);
                }}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                bgColor="#161b33"
                hoverColor="#111628"
                onClick={handleSubmitConfirm}
                loading={submitting}
                disabled={selectedReturn.total_denda > 0 && !confirmPayment}
              >
                Konfirmasi Pengembalian
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

