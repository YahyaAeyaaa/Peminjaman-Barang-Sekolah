'use client';

import { useState, useEffect } from 'react';
import { PetugasHero } from './components/PetugasHero';
import { StatCard } from './components/StatCard';
import { QuickActionCard } from './components/QuickActionCard';
import { quickActions } from './data/dashboardData';
import { Clock, CheckCircle, Package, Users, FileText } from 'lucide-react';

export default function PetugasPage() {
  const [stats, setStats] = useState({
    pendingApproval: 0,
    activePeminjaman: 0,
    overdueReturn: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    // Ambil data dari localStorage untuk hitung statistik
    const allPeminjaman = JSON.parse(localStorage.getItem('peminjaman') || '[]');
    
    const pending = allPeminjaman.filter(p => p.status === 'MENUNGGU_APPROVAL').length;
    const active = allPeminjaman.filter(p => p.status === 'DISETUJUI' || p.status === 'DIPINJAM').length;
    
    // Hitung overdue (estimasi kembali sudah lewat tapi belum dikembalikan)
    const today = new Date();
    const overdue = allPeminjaman.filter(p => {
      if (p.status !== 'DIPINJAM' && p.status !== 'DISETUJUI') return false;
      const estimasiKembali = new Date(p.estimasiKembali);
      return estimasiKembali < today;
    }).length;
    
    setStats({
      pendingApproval: pending,
      activePeminjaman: active,
      overdueReturn: overdue,
      totalUsers: 0, // Dalam real app, ini dari API
    });
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Hero Section */}
        <PetugasHero />

        {/* Statistics Cards */}
        <section className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
          <StatCard
            title="Pending Approval"
            value={stats.pendingApproval}
            subtitle="Menunggu persetujuan"
            icon={<Clock size={20} />}
            color="amber"
          />
          <StatCard
            title="Aktif Dipinjam"
            value={stats.activePeminjaman}
            subtitle="Sedang dalam peminjaman"
            icon={<Package size={20} />}
            color="blue"
          />
          <StatCard
            title="Total Peminjam"
            value={stats.totalUsers || '—'}
            subtitle="User terdaftar"
            icon={<Users size={20} />}
            color="emerald"
          />
        </section>

        {/* Quick Actions */}
        <section className="grid gap-6 md:grid-cols-3">
          {quickActions.map((item, index) => {
            const icons = [
              <CheckCircle key="0" className="text-amber-600" size={24} />,
              <Package key="1" className="text-emerald-600" size={24} />,
              <FileText key="2" className="text-blue-600" size={24} />,
            ];
            
            return (
              <QuickActionCard
                key={item.title}
                title={item.title}
                desc={item.desc}
                color={item.color}
                border={item.border}
                href={item.href}
                icon={icons[index]}
              />
            );
          })}
        </section>

        {/* Recent Activity Section */}
        <section className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-gray-400">Tugas Utama</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-900">Fokus pada tugas utama</h2>
              <p className="mt-3 text-gray-600">
                Sebagai petugas, fokus utama kamu adalah menyetujui peminjaman, memantau pengembalian, dan mencetak laporan untuk dokumentasi.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:w-1/2">
              <div className="rounded-2xl border border-dashed border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-800">Approval Cepat</p>
                <p className="text-sm text-gray-500">Review dan setujui pengajuan peminjaman dengan cepat dan efisien.</p>
              </div>
              <div className="rounded-2xl border border-dashed border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-800">Laporan Lengkap</p>
                <p className="text-sm text-gray-500">Cetak laporan peminjaman untuk keperluan dokumentasi dan arsip.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
