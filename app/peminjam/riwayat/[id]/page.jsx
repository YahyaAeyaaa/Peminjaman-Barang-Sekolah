'use client';

import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/button';
import { Calendar, Package, CheckCircle, AlertCircle, FileText, XCircle } from 'lucide-react';
import { useLoanDetail } from '@/app/peminjam/peminjaman/hooks/useLoanDetail';

export default function RiwayatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.id;

  const { loan, loading } = useLoanDetail(loanId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  // Riwayat:
  // - loan yang sudah dikembalikan & dikonfirmasi petugas, atau
  // - loan yang ditolak petugas
  const isHistory =
    !!loan &&
    ((loan.status === 'RETURNED' && loan.return?.status === 'DIKEMBALIKAN') ||
      loan.status === 'REJECTED');

  if (!loan || !isHistory) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Data riwayat tidak ditemukan atau belum selesai dikonfirmasi.
          </p>
          <Button variant="outline" onClick={() => router.push('/peminjam/riwayat')}>
            Kembali ke Riwayat
          </Button>
        </div>
      </div>
    );
  }

  const product = loan.product;
  const ret = loan.return;
  const isRejected = loan.status === 'REJECTED';

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gray-400 font-semibold mb-2">
              Peminjam • Riwayat • Detail
            </p>
            <h1 className="text-3xl font-bold text-gray-900">Detail Riwayat</h1>
            <p className="text-sm text-gray-600 mt-2">
              ID Peminjaman: <span className="font-mono font-semibold">{loan.id}</span>
            </p>
          </div>
          {isRejected ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-red-50 text-red-700 border-red-200">
              <XCircle size={16} />
              <span className="text-sm font-semibold">Ditolak</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
              <CheckCircle size={16} />
              <span className="text-sm font-semibold">Selesai</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Barang</h2>
          <div className="flex flex-col md:flex-row gap-6">
            {product.image && (
              <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
                {product.type}
              </p>
              <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Loan + (Return / Rejection) Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Detail Riwayat</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Package className="text-gray-400 mt-0.5" size={20} />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-[0.1em] font-semibold">Jumlah</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{loan.jumlah} unit</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400 mt-0.5" size={20} />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-[0.1em] font-semibold">Tanggal Pinjam</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{loan.labels.tanggal_pinjam}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400 mt-0.5" size={20} />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-[0.1em] font-semibold">Deadline</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{loan.labels.tanggal_deadline}</p>
              </div>
            </div>

            {!isRejected && (
              <div className="flex items-start gap-3">
                <Calendar className="text-gray-400 mt-0.5" size={20} />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-[0.1em] font-semibold">Tanggal Kembali</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{loan.labels.tanggal_kembali}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 md:col-span-2">
              <FileText className="text-gray-400 mt-0.5" size={20} />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-[0.1em] font-semibold">Keterangan</p>
                <p className="text-sm text-gray-700 mt-1">{loan.keterangan || '-'}</p>
              </div>
            </div>
          </div>

          {/* Denda & kondisi */}
          {isRejected ? (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex items-start gap-2 text-gray-700">
                <AlertCircle size={16} className="text-red-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-[0.1em] font-semibold">
                    Alasan Penolakan
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {loan.rejection_reason || 'Pengajuan peminjaman ini ditolak oleh petugas.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <AlertCircle size={16} className="text-gray-400" />
                <span className="text-sm">
                  Kondisi alat: <span className="font-semibold">{ret.kondisi_alat}</span>
                </span>
              </div>
              {ret.catatan && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-[0.1em] font-semibold mb-1">Catatan</p>
                  <p className="text-sm text-gray-700">{ret.catatan}</p>
                </div>
              )}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-sm text-emerald-800">
                  Total denda:{' '}
                  <span className="font-semibold">
                    Rp {Number(ret.total_denda || 0).toLocaleString('id-ID')}
                  </span>
                </p>
              </div>
              {ret.foto_bukti && (
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={ret.foto_bukti}
                    alt="Foto bukti pengembalian"
                    className="w-full max-h-96 object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => router.push('/peminjam/riwayat')}>
            Kembali ke Riwayat
          </Button>
        </div>
      </div>
    </div>
  );
}


