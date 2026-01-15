'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/button';
import { Calendar, Package, FileText, CheckCircle, Clock, XCircle, AlertCircle, Upload, RotateCcw } from 'lucide-react';
import { useLoanDetail } from '../hooks/useLoanDetail';
import { returnsAPI } from '@/lib/api/returns';
import { useToast } from '@/components/ToastProvider';

export default function PeminjamanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const peminjamanId = params.id;
  
  const toast = useToast();
  const { loan: peminjaman, loading, refetch } = useLoanDetail(peminjamanId);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnForm, setReturnForm] = useState({
    kondisi_alat: 'BAIK',
    catatan: '',
    foto_bukti: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        label: 'Menunggu Approval',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <Clock size={16} />,
        description: 'Pengajuan peminjaman sedang menunggu persetujuan dari petugas',
      },
      APPROVED: {
        label: 'Disetujui (Ambil barang)',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle size={16} />,
        description: 'Pengajuan peminjaman telah disetujui. Silakan ambil barang ke petugas.',
      },
      REJECTED: {
        label: 'Ditolak',
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: <XCircle size={16} />,
        description: 'Pengajuan peminjaman ditolak.',
      },
      BORROWED: {
        label: 'Sedang Dipinjam',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <Package size={16} />,
        description: 'Barang sedang dalam masa peminjaman.',
      },
      RETURNED: {
        label: 'Menunggu Konfirmasi Pengembalian',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <Clock size={16} />,
        description: 'Barang sudah kamu kembalikan. Menunggu petugas memverifikasi.',
      },
      OVERDUE: {
        label: 'Terlambat',
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: <AlertCircle size={16} />,
        description: 'Peminjaman melewati batas waktu pengembalian.',
      },
    };
    
    return configs[status] || configs.PENDING;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  if (!peminjaman) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Data peminjaman tidak ditemukan</p>
          <Button onClick={() => router.push('/peminjam/product')}>
            Kembali ke Daftar Produk
          </Button>
        </div>
      </div>
    );
  }

  const product = peminjaman.product;
  const statusConfig = getStatusConfig(peminjaman.status);

  // Hitung denda (mock calculation)
  const calculateDenda = () => {
    const today = new Date();
    const deadline = new Date(peminjaman.tanggal_deadline);
    const isLate = today > deadline;
    
    // Mock harga alat (dalam real app, ambil dari equipment)
    const hargaAlat = 1000000;
    const persentaseKerusakan = {
      'BAIK': 0,
      'RUSAK_RINGAN': 0.15,
      'RUSAK_SEDANG': 0.40,
      'RUSAK_BERAT': 0.70,
      'HILANG': 1.0
    };
    
    const dendaTelat = isLate ? 50000 : 0; // Mock: Rp 50rb per hari telat
    const dendaKerusakan = hargaAlat * (persentaseKerusakan[returnForm.kondisi_alat] || 0);
    const totalDenda = dendaTelat + dendaKerusakan;
    
    return { dendaTelat, dendaKerusakan, totalDenda };
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!peminjaman) return;

    try {
    setSubmitting(true);
    
      let fotoUrl = null;
      if (returnForm.foto_bukti) {
        const uploadRes = await returnsAPI.uploadProof(returnForm.foto_bukti);
        if (uploadRes.success) {
          fotoUrl = uploadRes.data.url;
        } else {
          throw new Error(uploadRes.error || 'Gagal upload foto bukti');
        }
      }

      const res = await returnsAPI.create({
        loan_id: peminjaman.id,
        kondisi_alat: returnForm.kondisi_alat,
        catatan: returnForm.catatan?.trim() || null,
        foto_bukti: fotoUrl,
      });

      if (res.success) {
        toast.success('Berhasil', 'Pengembalian berhasil diajukan, menunggu konfirmasi petugas');
      setShowReturnForm(false);
        setReturnForm({ kondisi_alat: 'BAIK', catatan: '', foto_bukti: null });
        await refetch();
      } else {
        toast.error(res.error || 'Gagal mengajukan pengembalian');
      }
    } catch (err) {
      console.error('Error submitting return:', err);
      toast.error(err.response?.data?.error || err.message || 'Gagal mengajukan pengembalian');
    } finally {
      setSubmitting(false);
    }
  };

  const denda = calculateDenda();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gray-400 font-semibold mb-2">
              Peminjam • Detail Peminjaman
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              Detail Peminjaman
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              ID Peminjaman: <span className="font-mono font-semibold">{peminjaman.id}</span>
            </p>
          </div>
          
          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusConfig.color}`}>
            {statusConfig.icon}
            <span className="text-sm font-semibold">{statusConfig.label}</span>
          </div>
        </div>

        {/* Status Description */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">{statusConfig.description}</p>
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Barang</h2>
          <div className="flex flex-col md:flex-row gap-6">
            {product.image && (
              <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
                  {product.type}
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mt-1">
                  {product.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Peminjaman Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detail Peminjaman</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400 mt-0.5" size={20} />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-[0.1em] font-semibold">
                  Tanggal Peminjaman
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {new Date(peminjaman.tanggal_pinjam).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400 mt-0.5" size={20} />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-[0.1em] font-semibold">
                  Deadline Pengembalian
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {new Date(peminjaman.tanggal_deadline).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="text-gray-400 mt-0.5" size={20} />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-[0.1em] font-semibold">
                  Jumlah Barang
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {peminjaman.jumlah} unit
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="text-gray-400 mt-0.5" size={20} />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-[0.1em] font-semibold">
                  Alasan Peminjaman
                </p>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                  {peminjaman.keterangan || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Pengembalian (jika status BORROWED) */}
        {peminjaman.status === 'BORROWED' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            {!showReturnForm ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-blue-500 mt-0.5" size={20} />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Kembalikan Barang
                    </h3>
                    <p className="text-sm text-gray-600">
                      Barang sudah selesai digunakan? Kembalikan sekarang dengan mengisi form pengembalian.
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  bgColor="#161b33"
                  hoverColor="#111628"
                  leftIcon={<RotateCcw size={18} />}
                  onClick={() => setShowReturnForm(true)}
                  className="w-full sm:w-auto"
                >
                  Kembalikan Barang
                </Button>
              </div>
            ) : (
              <form onSubmit={handleReturnSubmit} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Form Pengembalian Barang
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowReturnForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                {/* Kondisi Alat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kondisi Alat <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={returnForm.kondisi_alat}
                    onChange={(e) => setReturnForm({ ...returnForm, kondisi_alat: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#161b33] focus:border-transparent"
                    required
                  >
                    <option value="BAIK">Baik (Tidak ada kerusakan)</option>
                    <option value="RUSAK_RINGAN">Rusak Ringan (10-20% biaya)</option>
                    <option value="RUSAK_SEDANG">Rusak Sedang (30-50% biaya)</option>
                    <option value="RUSAK_BERAT">Rusak Berat (60-80% biaya)</option>
                    <option value="HILANG">Hilang (100% biaya)</option>
                  </select>
                </div>

                {/* Catatan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan (Optional)
                  </label>
                  <textarea
                    value={returnForm.catatan}
                    onChange={(e) => setReturnForm({ ...returnForm, catatan: e.target.value })}
                    placeholder="Tambahkan catatan jika ada..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#161b33] focus:border-transparent"
                  />
                </div>

                {/* Upload Foto (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto Bukti (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <Upload size={18} className="text-gray-400" />
                      <span className="text-sm text-gray-700">Upload Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setReturnForm({ ...returnForm, foto_bukti: e.target.files[0] })}
                        className="hidden"
                      />
                    </label>
                    {returnForm.foto_bukti && (
                      <span className="text-sm text-gray-600">
                        {returnForm.foto_bukti.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Preview Denda */}
                {denda.totalDenda > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-amber-900 mb-2">
                      Estimasi Denda
                    </h4>
                    <div className="space-y-1 text-sm text-amber-800">
                      {denda.dendaTelat > 0 && (
                        <div className="flex justify-between">
                          <span>Denda Keterlambatan:</span>
                          <span className="font-semibold">Rp {denda.dendaTelat.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {denda.dendaKerusakan > 0 && (
                        <div className="flex justify-between">
                          <span>Denda Kerusakan:</span>
                          <span className="font-semibold">Rp {denda.dendaKerusakan.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-amber-300">
                        <span className="font-semibold">Total Denda:</span>
                        <span className="font-bold text-lg">Rp {denda.totalDenda.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {denda.totalDenda === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      ✓ Tidak ada denda. Barang akan dikonfirmasi oleh petugas setelah pengembalian.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReturnForm(false)}
                    className="flex-1"
                    disabled={submitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    bgColor="#161b33"
                    hoverColor="#111628"
                    loading={submitting}
                    className="flex-1"
                  >
                    Submit Pengembalian
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Status APPROVED - Tombol Ambil Barang */}
        {peminjaman.status === 'APPROVED' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <CheckCircle className="text-emerald-600 mt-0.5" size={20} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-1">
                    Pengajuan Disetujui
                  </h3>
                  <p className="text-sm text-emerald-800">
                    Pengajuan peminjaman telah disetujui. Silakan datang ke lokasi dengan bukti approval untuk mengambil barang.
                  </p>
                  <p className="text-xs text-emerald-700 mt-2">
                    Batas waktu pengambilan: 3 hari dari tanggal approval
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                bgColor="#161b33"
                hoverColor="#111628"
                leftIcon={<Package size={18} />}
                onClick={() => {
                  // Konfirmasi ambil barang dilakukan oleh PETUGAS via halaman approval.
                  // Di sisi peminjam, ini hanya informasi bahwa barang siap diambil.
                }}
                loading={submitting}
                className="whitespace-nowrap"
                disabled
              >
                Siap diambil (konfirmasi oleh petugas)
              </Button>
            </div>
          </div>
        )}

        {/* Status RETURNED */}
        {peminjaman.status === 'RETURNED' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Clock className="text-amber-600 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-1">
                  Menunggu Konfirmasi Petugas
                </h3>
                <p className="text-sm text-amber-800">
                  Kamu sudah mengajukan pengembalian. Petugas akan memverifikasi kondisi barang.
                  {denda.totalDenda > 0 && (
                    <span className="block mt-2 font-semibold">
                      Estimasi total denda: Rp {denda.totalDenda.toLocaleString('id-ID')}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/peminjam/peminjaman')}
            className="px-6"
          >
            Kembali ke Daftar Peminjaman
          </Button>
        </div>
      </div>
    </div>
  );
}

