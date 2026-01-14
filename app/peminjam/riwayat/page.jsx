'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Package, CheckCircle, XCircle } from 'lucide-react';
import { useMyLoans } from '../peminjaman/hooks/useMyLoans';

export default function RiwayatPage() {
  const router = useRouter();
  const { allLoans, historyLoans, loading } = useMyLoans();

  const riwayatList = useMemo(() => {
    // History = loan yang sudah selesai (dikembalikan & dikonfirmasi) atau sudah ditolak
    // Sort terbaru dulu berdasarkan tanggal_kembali (fallback tanggal_pinjam)
    const list = [...historyLoans];
    list.sort((a, b) => {
      const aDate = a.tanggal_kembali ? new Date(a.tanggal_kembali) : new Date(a.tanggal_pinjam);
      const bDate = b.tanggal_kembali ? new Date(b.tanggal_kembali) : new Date(b.tanggal_pinjam);
      return bDate - aDate;
    });
    return list;
  }, [historyLoans]);

  const getStatusConfig = (status) => {
    const configs = {
      RETURNED: {
        label: 'Selesai (Dikembalikan)',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle size={14} />,
      },
      REJECTED: {
        label: 'Ditolak',
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: <XCircle size={14} />,
      },
    };
    
    return configs[status] || configs.RETURNED;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
            Peminjam • Riwayat
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Riwayat Peminjaman
          </h1>
          <p className="text-base text-gray-600 max-w-3xl">
            Lihat semua barang yang pernah kamu pinjam dan sudah dikembalikan.
          </p>
        </header>

        {/* Info jumlah */}
        {riwayatList.length > 0 && (
          <div className="text-sm text-gray-500">
            Menampilkan <span className="font-semibold text-gray-700">{riwayatList.length}</span> riwayat peminjaman
          </div>
        )}

        {/* Grid riwayat */}
        {riwayatList.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                <Package className="text-gray-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Belum ada riwayat peminjaman
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Kamu belum memiliki riwayat peminjaman yang sudah selesai. Mulai pinjam barang dari halaman produk.
                </p>
                <button
                  onClick={() => router.push('/peminjam/product')}
                  className="px-6 py-2.5 bg-[#161b33] text-white rounded-lg text-sm font-semibold hover:bg-[#111628] transition shadow-sm"
                >
                  Lihat Daftar Produk
                </button>
              </div>
            </div>
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {riwayatList.map((peminjaman) => {
              const product = peminjaman.product;
              const statusConfig = getStatusConfig(peminjaman.status);
              
              return (
                <div
                  key={peminjaman.id}
                  onClick={() => router.push(`/peminjam/riwayat/${peminjaman.id}`)}
                  className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 cursor-pointer"
                >
                  {/* Image Section */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90"
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
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${statusConfig.color} backdrop-blur-sm bg-white/95`}>
                        {statusConfig.icon}
                        <span>{statusConfig.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 space-y-4">
                    {/* Title */}
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold mb-1">
                        {product.type}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    {/* Info Peminjaman */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package size={16} className="text-gray-400" />
                        <span>
                          Jumlah: <span className="font-semibold text-gray-900">{peminjaman.jumlah} unit</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        <span>
                          Tanggal pinjam:{' '}
                          <span className="font-semibold text-gray-900">{peminjaman.tanggal_pinjam_label}</span>
                        </span>
                      </div>
                      {peminjaman.tanggal_kembali && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} className="text-gray-400" />
                          <span>
                            Dikembalikan:{' '}
                            <span className="font-semibold text-gray-900">{formatDate(peminjaman.tanggal_kembali)}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="pt-2 border-t border-gray-100">
                      <button className="w-full text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline text-center">
                        Lihat detail →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}


