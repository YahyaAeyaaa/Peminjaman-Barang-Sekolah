'use client';

import { useRouter } from 'next/navigation';
import { Eye, RotateCcw, Clock, CheckCircle, DollarSign, Package } from 'lucide-react';
import Button from '@/components/button';
import SearchComponent from '@/components/search';
import FilterSelect from '@/components/filterSelect';
import { useReturns } from './hooks/useReturns';
import { returnStatusOptions } from '@/helper/returnStatusOptions';

export default function ReturnsPage() {
  const router = useRouter();
  const {
    returns,
    loading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    counts,
    totalDenda,
    totalDendaDibayar,
  } = useReturns();

  const getStatusBadge = (status) => {
    const configs = {
      MENUNGGU_PEMBAYARAN: {
        label: 'Menunggu Konfirmasi',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <Clock size={14} />,
      },
      DIKEMBALIKAN: {
        label: 'Sudah Dikonfirmasi',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle size={14} />,
      },
    };
    const config = configs[status] || configs.MENUNGGU_PEMBAYARAN;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  const statusOptions = returnStatusOptions;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-2">
              Admin • Data Pengembalian
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
              Data Pengembalian
            </h1>
            <p className="text-gray-500 mt-2">
              Lihat dan monitor semua data pengembalian barang dalam sistem
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchComponent
              value={searchTerm}
              onChange={(val) => setSearchTerm(val)}
              placeholder="Cari berdasarkan nama peminjam, email, nama barang, atau kode alat..."
              size="medium"
            />
          </div>
          <div className="w-full sm:w-64">
            <FilterSelect
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={statusOptions}
              placeholder="Filter Status"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{counts.ALL}</div>
            <div className="text-xs text-gray-500 mt-1">Total Pengembalian</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-amber-600">{counts.MENUNGGU_PEMBAYARAN}</div>
            <div className="text-xs text-gray-500 mt-1">Menunggu Konfirmasi</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-emerald-600">{counts.DIKEMBALIKAN}</div>
            <div className="text-xs text-gray-500 mt-1">Sudah Dikonfirmasi</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <DollarSign size={20} />
              <div>
                <div className="text-2xl font-bold">Rp {totalDendaDibayar.toLocaleString('id-ID')}</div>
                <div className="text-xs text-gray-500 mt-1">Total Denda Dibayar</div>
              </div>
            </div>
          </div>
        </div>

        {/* Returns List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Memuat data pengembalian...</div>
          </div>
        ) : returns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <RotateCcw className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'ALL'
                ? 'Tidak ada data pengembalian yang sesuai dengan filter'
                : 'Belum ada data pengembalian'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peminjam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Barang
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Kembali
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kondisi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Denda
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {returns.map((returnItem) => (
                    <tr key={returnItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {returnItem.peminjam.name}
                          </div>
                          <div className="text-sm text-gray-500">{returnItem.peminjam.email}</div>
                          {returnItem.peminjam.kelas && (
                            <div className="text-xs text-gray-400">{returnItem.peminjam.kelas}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {returnItem.equipment.image ? (
                            <img
                              src={returnItem.equipment.image}
                              alt={returnItem.equipment.name}
                              className="w-12 h-12 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = '/image/cat.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {returnItem.equipment.name}
                            </div>
                            <div className="text-xs text-gray-500">{returnItem.equipment.kategori}</div>
                            {returnItem.equipment.kode_alat && (
                              <div className="text-xs text-gray-400">
                                Kode: {returnItem.equipment.kode_alat}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{returnItem.equipment.jumlah} unit</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{returnItem.tanggal_kembali}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${returnItem.kondisi_color}`}
                        >
                          {returnItem.kondisi_label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {returnItem.total_denda > 0 ? (
                          <div>
                            <div className="text-sm font-medium text-red-600">
                              Rp {returnItem.total_denda.toLocaleString('id-ID')}
                            </div>
                            {returnItem.denda_dibayar > 0 && (
                              <div className="text-xs text-green-600">
                                Dibayar: Rp {returnItem.denda_dibayar.toLocaleString('id-ID')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Tidak ada denda</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(returnItem.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/returns/${returnItem.id}`)}
                        >
                          <Eye size={14} className="mr-1.5" />
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

