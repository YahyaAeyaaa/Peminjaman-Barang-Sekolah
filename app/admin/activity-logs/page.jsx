'use client';

import { useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Database,
  Code,
  Globe,
  Monitor,
  X,
} from 'lucide-react';
import Button from '@/components/button';
import SearchComponent from '@/components/search';
import FilterSelect from '@/components/filterSelect';
import Input from '@/components/forminput';
import { useActivityLogs } from './hooks/useActivityLogs';
import { getTableOptions } from '@/helper/activityLogOptions';

export default function ActivityLogsPage() {
  const {
    logs,
    loading,
    pagination,
    searchTerm,
    setSearchTerm,
    filterAction,
    setFilterAction,
    filterTable,
    setFilterTable,
    filterDateFrom,
    setFilterDateFrom,
    filterDateTo,
    setFilterDateTo,
    availableActions,
    availableTables,
    loadPage,
  } = useActivityLogs();

  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const toggleExpand = (logId) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const actionOptions = [
    { value: 'ALL', label: 'Semua Aksi' },
    ...availableActions.map((action) => ({
      value: action,
      label: action === 'CREATE' ? 'Membuat' : action === 'UPDATE' ? 'Mengubah' : action === 'DELETE' ? 'Menghapus' : action,
    })),
  ];

  const tableOptions = getTableOptions(availableTables);

  const formatJSON = (data) => {
    if (!data) return null;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-2">
              Admin • Log Aktivitas
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
              Log Aktivitas
            </h1>
            <p className="text-gray-500 mt-2">
              Monitor semua aktivitas pengguna dalam sistem
            </p>
          </div>
        </div>

        {/* Search and Filter Toggle */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchComponent
                value={searchTerm}
                onChange={(val) => setSearchTerm(val)}
                placeholder="Cari berdasarkan user, action, atau table..."
                size="medium"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="whitespace-nowrap"
            >
              <Filter size={16} className="mr-2" />
              Filter
              {showFilters ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Aksi</label>
                  <FilterSelect
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    options={actionOptions}
                    placeholder="Filter Aksi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Tabel</label>
                  <FilterSelect
                    value={filterTable}
                    onChange={(e) => setFilterTable(e.target.value)}
                    options={tableOptions}
                    placeholder="Filter Tabel"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Dari Tanggal</label>
                  <Input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Sampai Tanggal</label>
                  <Input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              </div>
              {(filterAction !== 'ALL' || filterTable !== 'ALL' || filterDateFrom || filterDateTo) && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterAction('ALL');
                      setFilterTable('ALL');
                      setFilterDateFrom('');
                      setFilterDateTo('');
                    }}
                  >
                    <X size={14} className="mr-1" />
                    Reset Filter
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
            <div className="text-xs text-gray-500 mt-1">Total Log</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{availableActions.length}</div>
            <div className="text-xs text-gray-500 mt-1">Jenis Aksi</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-purple-600">{availableTables.length}</div>
            <div className="text-xs text-gray-500 mt-1">Tabel Terlibat</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-emerald-600">{logs.length}</div>
            <div className="text-xs text-gray-500 mt-1">Tampil</div>
          </div>
        </div>

        {/* Logs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Memuat log aktivitas...</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              {searchTerm || filterAction !== 'ALL' || filterTable !== 'ALL' || filterDateFrom || filterDateTo
                ? 'Tidak ada log yang sesuai dengan filter'
                : 'Belum ada log aktivitas'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${log.action_color}`}
                      >
                        {log.action_label}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        <Database size={12} />
                        {log.table_label}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {log.created_at}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                      {log.user && (
                        <span className="flex items-center gap-1.5">
                          <User size={14} />
                          {log.user.name} ({log.user.email})
                        </span>
                      )}
                      {log.ip_address && (
                        <span className="flex items-center gap-1.5">
                          <Globe size={14} />
                          {log.ip_address}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Code size={14} />
                        ID: {log.record_id.substring(0, 8)}...
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpand(log.id)}
                  >
                    {expandedLogs.has(log.id) ? (
                      <>
                        <ChevronUp size={14} className="mr-1" />
                        Sembunyikan
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} className="mr-1" />
                        Detail
                      </>
                    )}
                  </Button>
                </div>

                {/* Expanded Details */}
                {expandedLogs.has(log.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    {log.old_data && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Data Sebelumnya (Old Data)
                        </label>
                        <pre className="bg-gray-50 rounded-lg p-3 text-xs overflow-x-auto border border-gray-200">
                          {formatJSON(log.old_data)}
                        </pre>
                      </div>
                    )}

                    {log.new_data && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Data Baru (New Data)
                        </label>
                        <pre className="bg-gray-50 rounded-lg p-3 text-xs overflow-x-auto border border-gray-200">
                          {formatJSON(log.new_data)}
                        </pre>
                      </div>
                    )}

                    {log.user_agent && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          User Agent
                        </label>
                        <p className="text-xs text-gray-600 flex items-center gap-1.5">
                          <Monitor size={12} />
                          {log.user_agent}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-gray-500 mb-1">Record ID</label>
                        <p className="font-mono text-gray-900">{log.record_id}</p>
                      </div>
                      {log.user && (
                        <div>
                          <label className="block text-gray-500 mb-1">Role User</label>
                          <p className="text-gray-900">{log.user.role}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">
              Menampilkan {((pagination.page - 1) * pagination.limit) + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} log
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPage(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-gray-600">
                Halaman {pagination.page} dari {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

