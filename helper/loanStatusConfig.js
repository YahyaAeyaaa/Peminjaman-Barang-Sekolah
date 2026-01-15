'use client';

import { Clock, CheckCircle, XCircle, Package, RotateCcw, AlertCircle } from 'lucide-react';

/**
 * Status config untuk loan dengan icon dan description (untuk detail page)
 */
export const getLoanStatusConfig = (status, iconSize = 16) => {
  const configs = {
    PENDING: {
      label: 'Menunggu Approval',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <Clock size={iconSize} />,
      description: 'Pengajuan peminjaman sedang menunggu persetujuan dari petugas',
    },
    APPROVED: {
      label: 'Disetujui (Ambil barang)',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <CheckCircle size={iconSize} />,
      description: 'Pengajuan peminjaman telah disetujui. Silakan ambil barang ke petugas.',
    },
    REJECTED: {
      label: 'Ditolak',
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: <XCircle size={iconSize} />,
      description: 'Pengajuan peminjaman ditolak.',
    },
    BORROWED: {
      label: 'Sedang Dipinjam',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <Package size={iconSize} />,
      description: 'Barang sedang dalam masa peminjaman.',
    },
    RETURNED: {
      label: 'Menunggu Konfirmasi Pengembalian',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <Clock size={iconSize} />,
      description: 'Barang sudah kamu kembalikan. Menunggu petugas memverifikasi.',
    },
    OVERDUE: {
      label: 'Terlambat',
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: <AlertCircle size={iconSize} />,
      description: 'Peminjaman melewati batas waktu pengembalian.',
    },
  };

  return configs[status] || configs.PENDING;
};

/**
 * Status config untuk loan tanpa description (untuk list/card view)
 */
export const getLoanStatusConfigSimple = (status, iconSize = 14) => {
  const configs = {
    PENDING: {
      label: 'Menunggu Approval',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <Clock size={iconSize} />,
    },
    APPROVED: {
      label: 'Disetujui (Ambil barang)',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <CheckCircle size={iconSize} />,
    },
    REJECTED: {
      label: 'Ditolak',
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: <XCircle size={iconSize} />,
    },
    BORROWED: {
      label: 'Sedang Dipinjam',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <Package size={iconSize} />,
    },
    RETURNED: {
      label: 'Menunggu Konfirmasi Pengembalian',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <Clock size={iconSize} />,
    },
  };

  return configs[status] || configs.PENDING;
};

