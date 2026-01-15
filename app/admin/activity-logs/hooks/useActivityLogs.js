import { useCallback, useEffect, useMemo, useState } from 'react';
import { activityLogsAPI } from '@/lib/api/activityLogs';
import { useToast } from '@/components/ToastProvider';

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDateOnly(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0]; // YYYY-MM-DD
}

function getActionLabel(action) {
  const labels = {
    CREATE: 'Membuat',
    UPDATE: 'Mengubah',
    DELETE: 'Menghapus',
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    APPROVE: 'Menyetujui',
    REJECT: 'Menolak',
    CONFIRM: 'Mengkonfirmasi',
    UPLOAD: 'Mengupload',
    DOWNLOAD: 'Mengunduh',
  };
  return labels[action] || action;
}

function getActionColor(action) {
  const colors = {
    CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
    DELETE: 'bg-red-50 text-red-700 border-red-200',
    LOGIN: 'bg-green-50 text-green-700 border-green-200',
    LOGOUT: 'bg-gray-50 text-gray-700 border-gray-200',
    APPROVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECT: 'bg-red-50 text-red-700 border-red-200',
    CONFIRM: 'bg-purple-50 text-purple-700 border-purple-200',
    UPLOAD: 'bg-blue-50 text-blue-700 border-blue-200',
    DOWNLOAD: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };
  return colors[action] || 'bg-gray-50 text-gray-700 border-gray-200';
}

function getTableLabel(tableName) {
  const labels = {
    users: 'User',
    equipment: 'Alat',
    loans: 'Peminjaman',
    returns: 'Pengembalian',
    categories: 'Kategori',
    registration_codes: 'Kode Registrasi',
    articles: 'Artikel',
  };
  return labels[tableName] || tableName;
}

function mapLogToUI(log) {
  return {
    id: log.id,
    action: log.action,
    action_label: getActionLabel(log.action),
    action_color: getActionColor(log.action),
    table_name: log.table_name,
    table_label: getTableLabel(log.table_name),
    record_id: log.record_id,
    old_data: log.old_data,
    new_data: log.new_data,
    ip_address: log.ip_address,
    user_agent: log.user_agent,
    created_at: formatDate(log.created_at),
    created_at_raw: log.created_at,
    user: log.user
      ? {
          id: log.user.id,
          name: `${log.user.first_name ?? ''} ${log.user.last_name ?? ''}`.trim() || log.user.email,
          email: log.user.email,
          role: log.user.role,
        }
      : null,
  };
}

export function useActivityLogs() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [logsRaw, setLogsRaw] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterTable, setFilterTable] = useState('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const loadLogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 50,
      };

      if (filterAction !== 'ALL') {
        params.action = filterAction;
      }

      if (filterTable !== 'ALL') {
        params.table_name = filterTable;
      }

      if (filterDateFrom) {
        params.date_from = filterDateFrom;
      }

      if (filterDateTo) {
        params.date_to = filterDateTo;
      }

      const res = await activityLogsAPI.getAll(params);
      if (res.success) {
        setLogsRaw(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 });
      } else {
        toast.error(res.error || 'Gagal memuat log aktivitas');
      }
    } catch (e) {
      console.error('Error fetching activity logs:', e);
      toast.error('Gagal memuat log aktivitas');
    } finally {
      setLoading(false);
    }
  }, [filterAction, filterTable, filterDateFrom, filterDateTo, toast]);

  useEffect(() => {
    loadLogs(1);
  }, [loadLogs]);

  const logs = useMemo(() => logsRaw.map(mapLogToUI), [logsRaw]);

  // Filter by search term (client-side, karena API belum support search)
  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs;

    const searchLower = searchTerm.toLowerCase();
    return logs.filter((log) => {
      return (
        log.user?.name.toLowerCase().includes(searchLower) ||
        log.user?.email.toLowerCase().includes(searchLower) ||
        log.action_label.toLowerCase().includes(searchLower) ||
        log.table_label.toLowerCase().includes(searchLower) ||
        log.record_id.toLowerCase().includes(searchLower)
      );
    });
  }, [logs, searchTerm]);

  // Get unique actions and tables for filter options
  const availableActions = useMemo(() => {
    const actions = new Set();
    logsRaw.forEach((log) => actions.add(log.action));
    return Array.from(actions).sort();
  }, [logsRaw]);

  const availableTables = useMemo(() => {
    const tables = new Set();
    logsRaw.forEach((log) => tables.add(log.table_name));
    return Array.from(tables).sort();
  }, [logsRaw]);

  return {
    logs: filteredLogs,
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
    refetch: () => loadLogs(pagination.page),
    loadPage: loadLogs,
  };
}


