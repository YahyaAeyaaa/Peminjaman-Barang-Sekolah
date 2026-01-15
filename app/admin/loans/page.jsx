'use client';

import { useRouter } from 'next/navigation';
import { Eye, Package, Clock, CheckCircle, XCircle, RotateCcw, AlertCircle } from 'lucide-react';
import Button from '@/components/button';
import SearchComponent from '@/components/search';
import FilterSelect from '@/components/filterSelect';
import { useLoans } from './hooks/useLoans';
import { loanStatusOptions } from '@/helper/loanStatusOptions';

export default function LoansPage() {
  const router = useRouter();
  const {
    loans,
    loading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    counts,
  } = useLoans();

  const getStatusBadge = (status) => {
    const configs = {
      PENDING: {
        label: 'Menunggu Approval',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <Clock size={14} />,
      },
      APPROVED: {
        label: 'Disetujui (Menunggu Diambil)',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle size={14} />,
      },
      REJECTED: {
        label: 'Ditolak',
        className: 'bg-red-50 text-red-700 border-red-200',
        icon: <XCircle size={14} />,
      },
      BORROWED: {
        label: 'Sedang Dipinjam',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <Package size={14} />,
      },
      RETURNED: {
        label: 'Dikembalikan',
        className: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: <RotateCcw size={14} />,
      },
      OVERDUE: {
        label: 'Terlambat',
        className: 'bg-red-50 text-red-700 border-red-200',
        icon: <AlertCircle size={14} />,
      },
    };
    const config = configs[status] || configs.PENDING;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  const statusOptions = loanStatusOptions;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-2">
              Admin • Data Peminjaman
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
              Data Peminjaman
            </h1>
            <p className="text-gray-500 mt-2">
              Lihat dan monitor semua data peminjaman dalam sistem
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{counts.ALL}</div>
            <div className="text-xs text-gray-500 mt-1">Total</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-amber-600">{counts.PENDING}</div>
            <div className="text-xs text-gray-500 mt-1">Pending</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-emerald-600">{counts.APPROVED}</div>
            <div className="text-xs text-gray-500 mt-1">Approved</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{counts.BORROWED}</div>
            <div className="text-xs text-gray-500 mt-1">Dipinjam</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-purple-600">{counts.RETURNED}</div>
            <div className="text-xs text-gray-500 mt-1">Dikembalikan</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">{counts.REJECTED}</div>
            <div className="text-xs text-gray-500 mt-1">Ditolak</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">{counts.OVERDUE}</div>
            <div className="text-xs text-gray-500 mt-1">Terlambat</div>
          </div>
        </div>

        {/* Loans List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Memuat data peminjaman...</div>
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'ALL'
                ? 'Tidak ada data peminjaman yang sesuai dengan filter'
                : 'Belum ada data peminjaman'}
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
                      Tanggal Pinjam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
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
                  {loans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{loan.peminjam.name}</div>
                          <div className="text-sm text-gray-500">{loan.peminjam.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {loan.product.image ? (
                            <img
                              src={loan.product.image}
                              alt={loan.product.name}
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
                            <div className="text-sm font-medium text-gray-900">{loan.product.name}</div>
                            <div className="text-xs text-gray-500">{loan.product.type}</div>
                            {loan.product.kode_alat && (
                              <div className="text-xs text-gray-400">Kode: {loan.product.kode_alat}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{loan.jumlah}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{loan.tanggal_pinjam}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{loan.tanggal_deadline}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(loan.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/loans/${loan.id}`)}
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

