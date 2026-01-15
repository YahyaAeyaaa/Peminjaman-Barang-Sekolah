'use client';

import { useParams, useRouter } from 'next/navigation';
import { Calendar, Package, FileText, CheckCircle, Clock, XCircle, AlertCircle, RotateCcw, ArrowLeft, User, Mail, Phone, MapPin } from 'lucide-react';
import Button from '@/components/button';
import { useLoanDetail } from '@/app/peminjam/peminjaman/hooks/useLoanDetail';

export default function AdminLoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.id;
  
  const { loan, loading } = useLoanDetail(loanId);

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        label: 'Menunggu Approval',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <Clock size={20} />,
        description: 'Pengajuan peminjaman sedang menunggu persetujuan dari petugas',
      },
      APPROVED: {
        label: 'Disetujui (Menunggu Diambil)',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle size={20} />,
        description: 'Pengajuan peminjaman telah disetujui. Menunggu peminjam mengambil barang.',
      },
      REJECTED: {
        label: 'Ditolak',
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: <XCircle size={20} />,
        description: 'Pengajuan peminjaman ditolak.',
      },
      BORROWED: {
        label: 'Sedang Dipinjam',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <Package size={20} />,
        description: 'Barang sedang dalam masa peminjaman.',
      },
      RETURNED: {
        label: 'Dikembalikan',
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: <RotateCcw size={20} />,
        description: 'Barang sudah dikembalikan oleh peminjam.',
      },
      OVERDUE: {
        label: 'Terlambat',
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: <AlertCircle size={20} />,
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

  if (!loan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Data peminjaman tidak ditemukan</p>
          <Button onClick={() => router.push('/admin/loans')}>
            Kembali ke Daftar Peminjaman
          </Button>
        </div>
      </div>
    );
  }

  const product = loan.product;
  const statusConfig = getStatusConfig(loan.status);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/loans')}
          >
            <ArrowLeft size={16} className="mr-2" />
            Kembali
          </Button>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-1">
              Admin • Detail Peminjaman
            </p>
            <h1 className="text-2xl font-semibold text-gray-900">Detail Peminjaman</h1>
          </div>
        </div>

        {/* Status Card */}
        <div className={`rounded-lg border p-6 ${statusConfig.color}`}>
          <div className="flex items-start gap-4">
            {statusConfig.icon}
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1">{statusConfig.label}</h2>
              <p className="text-sm opacity-90">{statusConfig.description}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package size={20} />
                Informasi Barang
              </h3>
              <div className="space-y-4">
                {product.image && (
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/image/cat.jpg';
                      }}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Nama Barang</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{product.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Kategori</label>
                    <p className="text-sm text-gray-700 mt-1">{product.type}</p>
                  </div>
                  {product.kode_alat && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Kode Alat</label>
                      <p className="text-sm text-gray-700 mt-1">{product.kode_alat}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Stok</label>
                    <p className="text-sm text-gray-700 mt-1">{product.stock} unit</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Deskripsi</label>
                    <p className="text-sm text-gray-700 mt-1">{product.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Borrower Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} />
                Informasi Peminjam
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Nama</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{loan.peminjam?.name || '—'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
                  <p className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    {loan.peminjam?.email || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Loan Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} />
                Detail Peminjaman
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Jumlah</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{loan.jumlah} unit</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <Calendar size={14} />
                    Tanggal Pinjam
                  </label>
                  <p className="text-sm text-gray-700 mt-1">{loan.labels.tanggal_pinjam}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <Calendar size={14} />
                    Deadline Pengembalian
                  </label>
                  <p className="text-sm text-gray-700 mt-1">{loan.labels.tanggal_deadline}</p>
                </div>
                {loan.labels.tanggal_ambil && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      <Calendar size={14} />
                      Tanggal Ambil
                    </label>
                    <p className="text-sm text-gray-700 mt-1">{loan.labels.tanggal_ambil}</p>
                  </div>
                )}
                {loan.labels.tanggal_kembali && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      <Calendar size={14} />
                      Tanggal Kembali
                    </label>
                    <p className="text-sm text-gray-700 mt-1">{loan.labels.tanggal_kembali}</p>
                  </div>
                )}
                {loan.labels.approved_at && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      <CheckCircle size={14} />
                      Disetujui Pada
                    </label>
                    <p className="text-sm text-gray-700 mt-1">{loan.labels.approved_at}</p>
                  </div>
                )}
                {loan.keterangan && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Keterangan</label>
                    <p className="text-sm text-gray-700 mt-1">{loan.keterangan}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rejection Info */}
            {loan.status === 'REJECTED' && loan.rejection_reason && (
              <div className="bg-red-50 rounded-lg border border-red-200 p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <XCircle size={20} />
                  Alasan Penolakan
                </h3>
                <p className="text-sm text-red-700">{loan.rejection_reason}</p>
              </div>
            )}

            {/* Return Info */}
            {loan.return && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <RotateCcw size={20} />
                  Informasi Pengembalian
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Status</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {loan.return.status === 'MENUNGGU_PEMBAYARAN'
                        ? 'Menunggu Pembayaran Denda'
                        : loan.return.status === 'DIKEMBALIKAN'
                          ? 'Sudah Dikonfirmasi'
                          : loan.return.status}
                    </p>
                  </div>
                  {loan.return.kondisi_alat && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Kondisi Alat</label>
                      <p className="text-sm text-gray-700 mt-1">{loan.return.kondisi_alat}</p>
                    </div>
                  )}
                  {loan.return.catatan && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Catatan</label>
                      <p className="text-sm text-gray-700 mt-1">{loan.return.catatan}</p>
                    </div>
                  )}
                  {loan.return.total_denda && loan.return.total_denda > 0 && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Total Denda</label>
                      <p className="text-sm font-medium text-red-600 mt-1">
                        Rp {loan.return.total_denda.toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}
                  {loan.return.foto_bukti && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                        Foto Bukti
                      </label>
                      <div className="rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={
                            loan.return.foto_bukti.startsWith('/')
                              ? loan.return.foto_bukti
                              : `/uploads/returns/${loan.return.foto_bukti}`
                          }
                          alt="Bukti pengembalian"
                          className="w-full h-auto"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {loan.return.confirmed_at && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Dikonfirmasi Pada</label>
                      <p className="text-sm text-gray-700 mt-1">
                        {new Date(loan.return.confirmed_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


