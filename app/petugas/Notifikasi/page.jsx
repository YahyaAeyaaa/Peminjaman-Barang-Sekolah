'use client';

import { Bell, Check, CheckCheck, Package, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { useNotif } from './hooks/useNotif';
import Button from '@/components/button';

export default function NotifikasiPage() {
  const {
    loading,
    notifications,
    unreadCount,
    activeTab,
    setActiveTab,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    markingAsRead,
  } = useNotif();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'RETURN_SUBMITTED':
        return <Package size={20} className="text-blue-600" />;
      case 'RETURN_LATE':
        return <AlertCircle size={20} className="text-red-600" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'RETURN_SUBMITTED':
        return 'bg-blue-50 border-blue-200';
      case 'RETURN_LATE':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Memuat notifikasi...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500 font-semibold">
            Petugas • Notifikasi
          </p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                Notifikasi
              </h1>
              <p className="text-base text-gray-600 max-w-3xl mt-2">
                Lihat semua notifikasi tentang pengembalian barang dan peminjaman telat.
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={markAllAsRead}
                disabled={markingAsRead}
                className="flex items-center gap-2"
              >
                <CheckCheck size={16} />
                {markingAsRead ? 'Memproses...' : 'Tandai Semua Dibaca'}
              </Button>
            )}
          </div>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Semua', count: notifications.length },
            { key: 'unread', label: 'Belum Dibaca', count: unreadCount },
            { key: 'read', label: 'Sudah Dibaca', count: notifications.length - unreadCount },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                activeTab === t.key
                  ? 'bg-[#161b33] text-white border-[#161b33]'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === t.key ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Info jumlah */}
        {notifications.length > 0 && (
          <div className="text-sm text-gray-500">
            Menampilkan <span className="font-semibold text-gray-700">{notifications.length}</span> notifikasi
            {activeTab === 'unread' && unreadCount > 0 && (
              <span className="ml-2">
                • <span className="font-semibold text-red-600">{unreadCount} belum dibaca</span>
              </span>
            )}
          </div>
        )}

        {/* List Notifications */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                <Bell className="text-gray-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeTab === 'unread' 
                    ? 'Tidak ada notifikasi belum dibaca' 
                    : activeTab === 'read'
                    ? 'Tidak ada notifikasi sudah dibaca'
                    : 'Belum ada notifikasi'}
                </h3>
                <p className="text-sm text-gray-600">
                  {activeTab === 'unread'
                    ? 'Semua notifikasi sudah dibaca.'
                    : 'Notifikasi akan muncul di sini ketika ada pengembalian barang atau peminjaman telat.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <section className="space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                  notif.is_read 
                    ? 'border-gray-200' 
                    : 'border-blue-300 bg-blue-50/50'
                }`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      notif.is_read ? 'bg-gray-100' : getNotificationColor(notif.type).replace('bg-', 'bg-').split(' ')[0] + ' bg-opacity-20'
                    }`}>
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-base font-semibold ${
                              notif.is_read ? 'text-gray-700' : 'text-gray-900'
                            }`}>
                              {notif.title}
                            </h3>
                            {!notif.is_read && (
                              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                            )}
                          </div>
                          <p className={`text-sm ${
                            notif.is_read ? 'text-gray-600' : 'text-gray-700'
                          }`}>
                            {notif.message}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif.id);
                            }}
                            className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Tandai sebagai dibaca"
                          >
                            <Check size={18} className="text-gray-400" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-500">
                          {formatDate(notif.created_at)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                          <span>Lihat detail</span>
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

