'use client';

import { useState, useEffect } from 'react';
import { AdminHero } from './components/AdminHero';
import { StatCard } from './components/StatCard';
import { QuickActionCard } from './components/QuickActionCard';
import { quickActions } from './data/dashboardData';
import { 
  Users, 
  Package, 
  FolderTree, 
  ClipboardList, 
  RotateCcw, 
  Activity,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { usersAPI } from '@/lib/api/users';
import { equipmentAPI } from '@/lib/api/equipment';
import { categoriesAPI } from '@/lib/api/categories';
import { loansAPI } from '@/lib/api/loans';
import { returnsAPI } from '@/lib/api/returns';
import { activityLogsAPI } from '@/lib/api/activityLogs';

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEquipment: 0,
    totalCategories: 0,
    activeLoans: 0,
    pendingReturns: 0,
    totalActivityLogs: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      let usersCount = 0;
      let equipmentCount = 0;
      let categoriesCount = 0;
      let activeLoansCount = 0;
      let pendingReturnsCount = 0;
      let activityLogsCount = 0;

      try {
        const usersRes = await usersAPI.getAll();
        if (usersRes && usersRes.success) {
          usersCount = usersRes.data.length;
        }
      } catch (err) {
        console.error('Gagal mengambil data users:', err);
      }

      try {
        const equipmentRes = await equipmentAPI.getAll();
        if (equipmentRes && equipmentRes.success) {
          equipmentCount = equipmentRes.data.length;
        }
      } catch (err) {
        console.error('Gagal mengambil data equipment:', err);
      }

      try {
        const categoriesRes = await categoriesAPI.getAll();
        if (categoriesRes && categoriesRes.success) {
          categoriesCount = categoriesRes.data.length;
        }
      } catch (err) {
        console.error('Gagal mengambil data categories:', err);
      }

      try {
        const activeLoansRes = await loansAPI.getAll({ status: 'BORROWED' });
        if (activeLoansRes && activeLoansRes.success) {
          activeLoansCount = activeLoansRes.data.length;
        }
      } catch (err) {
        console.error('Gagal mengambil data active loans:', err);
      }

      try {
        const pendingReturnsRes = await returnsAPI.getAll({ status: 'MENUNGGU_PEMBAYARAN' });
        if (pendingReturnsRes && pendingReturnsRes.success) {
          pendingReturnsCount = pendingReturnsRes.data.length;
        }
      } catch (err) {
        console.error('Gagal mengambil data pending returns:', err);
      }

      try {
        const activityLogsRes = await activityLogsAPI.getAll();
        if (activityLogsRes && activityLogsRes.success) {
          activityLogsCount = activityLogsRes.data.length;
        }
      } catch (err) {
        console.error('Gagal mengambil data activity logs:', err);
      }

      setStats({
        totalUsers: usersCount,
        totalEquipment: equipmentCount,
        totalCategories: categoriesCount,
        activeLoans: activeLoansCount,
        pendingReturns: pendingReturnsCount,
        totalActivityLogs: activityLogsCount,
      });
    };

    loadStats();
  }, []);

  const icons = [
    <Users key="0" className="text-indigo-600" size={24} />,
    <Package key="1" className="text-blue-600" size={24} />,
    <FolderTree key="2" className="text-purple-600" size={24} />,
    <ClipboardList key="3" className="text-emerald-600" size={24} />,
    <RotateCcw key="4" className="text-amber-600" size={24} />,
    <Activity key="5" className="text-pink-600" size={24} />,
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Hero Section */}
        <AdminHero />

        {/* Statistics Cards */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total User"
            value={stats.totalUsers || '—'}
            subtitle="Semua pengguna sistem"
            icon={<Users size={20} />}
            color="indigo"
          />
          <StatCard
            title="Total Alat"
            value={stats.totalEquipment || '—'}
            subtitle="Alat tersedia"
            icon={<Package size={20} />}
            color="blue"
          />
          <StatCard
            title="Total Kategori"
            value={stats.totalCategories || '—'}
            subtitle="Kategori alat"
            icon={<FolderTree size={20} />}
            color="purple"
          />
          <StatCard
            title="Peminjaman Aktif"
            value={stats.activeLoans || '—'}
            subtitle="Sedang dipinjam"
            icon={<ClipboardList size={20} />}
            color="emerald"
          />
          <StatCard
            title="Pengembalian Pending"
            value={stats.pendingReturns || '—'}
            subtitle="Menunggu konfirmasi"
            icon={<RotateCcw size={20} />}
            color="amber"
          />
          <StatCard
            title="Log Aktifitas"
            value={stats.totalActivityLogs || '—'}
            subtitle="Total aktivitas"
            icon={<Activity size={20} />}
            color="pink"
          />
        </section>

        {/* Quick Actions */}
        <section>
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.4em] text-gray-400">Akses Cepat</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">Manajemen Sistem</h2>
            <p className="mt-3 text-gray-600">
              Kelola semua aspek sistem peminjaman alat dari dashboard ini.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((item, index) => (
              <QuickActionCard
                key={item.title}
                title={item.title}
                desc={item.desc}
                color={item.color}
                border={item.border}
                href={item.href}
                icon={icons[index]}
              />
            ))}
          </div>
        </section>

        {/* Recent Activity Section */}
        <section className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-gray-400">Fitur Utama</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-900">Kontrol Penuh Sistem</h2>
              <p className="mt-3 text-gray-600">
                Sebagai admin, Anda memiliki akses penuh untuk mengelola user, alat, kategori, peminjaman, pengembalian, dan memantau semua aktivitas dalam sistem.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:w-1/2">
              <div className="rounded-2xl border border-dashed border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-800">CRUD Lengkap</p>
                <p className="text-sm text-gray-500">Kelola semua data: User, Alat, Kategori, Peminjaman, dan Pengembalian.</p>
              </div>
              <div className="rounded-2xl border border-dashed border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-800">Activity Log</p>
                <p className="text-sm text-gray-500">Pantau semua aktivitas pengguna dalam sistem untuk keamanan dan audit.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

