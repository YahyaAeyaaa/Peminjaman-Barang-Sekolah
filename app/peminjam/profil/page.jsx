'use client';

import { Save, Lock, Camera } from 'lucide-react';
import Button from '@/components/button';
import { useProfileUser } from './hooks/useProfileUser';

export default function PeminjamProfilePage() {
  const { loading, saving, formData, formErrors, setFormData, handleProfileSubmit } =
    useProfileUser();

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        avatar: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const getInitials = () => {
    const first = formData.first_name?.charAt(0) || '';
    const last = formData.last_name?.charAt(0) || '';
    const combined = `${first}${last}`;
    return combined || (formData.email ? formData.email.charAt(0).toUpperCase() : '?');
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500">Memuat data profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-2">
            Peminjam • Profil
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
            Profil Saya
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola informasi pribadi. Perubahan email & password hanya dapat dilakukan oleh admin.
          </p>
        </div>

        {/* Avatar + Summary Card */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-center sm:items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-blue-600/10 border-4 border-blue-600/20 overflow-hidden flex items-center justify-center">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl sm:text-3xl font-semibold text-blue-700">
                  {getInitials()}
                </span>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Camera size={18} className="text-gray-700" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          <div className="text-center sm:text-left space-y-1 flex-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {[formData.first_name, formData.last_name].filter(Boolean).join(' ') || 'Peminjam'}
            </h2>
            <p className="text-gray-500 text-sm break-all">{formData.email}</p>
            <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
              Peminjam Aktif
            </span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {formErrors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {formErrors.general}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Depan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      first_name: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all ${
                    formErrors.first_name ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Nama depan"
                />
                {formErrors.first_name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Belakang <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      last_name: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all ${
                    formErrors.last_name ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Nama belakang"
                />
                {formErrors.last_name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.last_name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. HP</label>
                <input
                  type="text"
                  value={formData.no_hp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      no_hp: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all"
                  placeholder="081234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alamat: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all"
                  placeholder="Alamat lengkap"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email digunakan sebagai akun login dan tidak dapat diubah oleh peminjam.
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button
                type="submit"
                variant="primary"
                bgColor="#161b33"
                hoverColor="#111628"
                className="flex items-center gap-2"
                disabled={saving}
              >
                <Save size={18} />
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </div>

        {/* Security Info (read-only) */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Lock size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Keamanan Akun</h3>
              <p className="text-sm text-gray-500">
                Email dan password hanya dapat diubah oleh admin. Hubungi petugas/admin jika akun
                Anda bermasalah.
              </p>
            </div>
          </div>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Login
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value="********"
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Perubahan password dilakukan melalui admin. Demi keamanan, password asli tidak
                pernah ditampilkan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


