'use client';

import { useState, useEffect } from 'react';
import { Save, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/button';
import Input from '@/components/forminput';
import { useToast } from '@/components/ToastProvider';

export default function AdminProfilePage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    no_hp: '',
    alamat: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (data?.user) {
        setUser(data.user);
        setFormData({
          first_name: data.user.first_name || '',
          last_name: data.user.last_name || '',
          email: data.user.email || '',
          no_hp: data.user.no_hp || '',
          alamat: data.user.alamat || '',
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Gagal Memuat Data', 'Terjadi kesalahan saat memuat data profil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validasi
    if (!formData.first_name.trim()) {
      setFormErrors({ first_name: 'Nama depan wajib diisi' });
      return;
    }

    if (!formData.last_name.trim()) {
      setFormErrors({ last_name: 'Nama belakang wajib diisi' });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          no_hp: formData.no_hp?.trim() || null,
          alamat: formData.alamat?.trim() || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Profile Berhasil Diupdate', 'Data profil telah diperbarui');
        fetchUser(); // Refresh data
      } else {
        toast.error('Gagal Mengupdate', data.error || 'Terjadi kesalahan saat mengupdate profil');
        setFormErrors({ general: data.error || 'Terjadi kesalahan' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Gagal Mengupdate', error.message || 'Terjadi kesalahan saat mengupdate profil');
      setFormErrors({ general: error.message || 'Gagal mengupdate profil' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validasi
    if (!passwordData.current_password) {
      setFormErrors({ current_password: 'Password saat ini wajib diisi' });
      return;
    }

    if (!passwordData.new_password) {
      setFormErrors({ new_password: 'Password baru wajib diisi' });
      return;
    }

    if (passwordData.new_password.length < 6) {
      setFormErrors({ new_password: 'Password baru minimal 6 karakter' });
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setFormErrors({ confirm_password: 'Password baru dan konfirmasi tidak cocok' });
      return;
    }

    try {
      setSaving(true);
      // TODO: Buat API endpoint untuk change password yang validasi current password
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: passwordData.new_password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password Berhasil Diubah', 'Password telah diperbarui');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
      } else {
        toast.error('Gagal Mengubah Password', data.error || 'Terjadi kesalahan');
        setFormErrors({ general: data.error || 'Terjadi kesalahan' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Gagal Mengubah Password', error.message || 'Terjadi kesalahan');
      setFormErrors({ general: error.message || 'Gagal mengubah password' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500">Memuat data...</p>
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
            Admin • Settings
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
            Profile & Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola informasi akun dan pengaturan
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-[#161b33] border-b-2 border-[#161b33]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-[#161b33] border-b-2 border-[#161b33]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Ubah Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
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
                      setFormData({ ...formData, first_name: e.target.value })
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
                      setFormData({ ...formData, last_name: e.target.value })
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. HP
                  </label>
                  <input
                    type="text"
                    value={formData.no_hp}
                    onChange={(e) =>
                      setFormData({ ...formData, no_hp: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all"
                    placeholder="081234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat
                  </label>
                  <input
                    type="text"
                    value={formData.alamat}
                    onChange={(e) =>
                      setFormData({ ...formData, alamat: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all"
                    placeholder="Alamat lengkap"
                  />
                </div>
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
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {formErrors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {formErrors.general}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Saat Ini <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, current_password: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all pr-10 ${
                      formErrors.current_password ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Masukkan password saat ini"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formErrors.current_password && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.current_password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, new_password: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all pr-10 ${
                      formErrors.new_password ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formErrors.new_password && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.new_password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirm_password: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all pr-10 ${
                      formErrors.confirm_password ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Ulangi password baru"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formErrors.confirm_password && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.confirm_password}</p>
                )}
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
                  <Lock size={18} />
                  {saving ? 'Mengubah...' : 'Ubah Password'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}



