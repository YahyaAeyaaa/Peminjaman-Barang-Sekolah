import { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import { profileAPI } from '@/lib/api/profile';

const initialFormData = {
  first_name: '',
  last_name: '',
  email: '',
  no_hp: '',
  alamat: '',
};

const initialPasswordData = {
  current_password: '',
  new_password: '',
  confirm_password: '',
};

export function useProfile() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [passwordData, setPasswordData] = useState(initialPasswordData);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch user session
  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await profileAPI.getSession();

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

  useEffect(() => {
    fetchUser();
  }, []);

  // Handle profile submit
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
      const response = await profileAPI.update(user.id, {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        no_hp: formData.no_hp?.trim() || null,
        alamat: formData.alamat?.trim() || null,
      });

      if (response.success) {
        toast.success('Profile Berhasil Diupdate', 'Data profil telah diperbarui');
        fetchUser(); // Refresh data
      } else {
        toast.error('Gagal Mengupdate', response.error || 'Terjadi kesalahan saat mengupdate profil');
        setFormErrors({ general: response.error || 'Terjadi kesalahan' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Gagal Mengupdate', error.message || 'Terjadi kesalahan saat mengupdate profil');
      setFormErrors({ general: error.message || 'Gagal mengupdate profil' });
    } finally {
      setSaving(false);
    }
  };

  // Handle password submit
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
      const response = await profileAPI.changePassword(user.id, passwordData.new_password);

      if (response.success) {
        toast.success('Password Berhasil Diubah', 'Password telah diperbarui');
        setPasswordData(initialPasswordData);
      } else {
        toast.error('Gagal Mengubah Password', response.error || 'Terjadi kesalahan');
        setFormErrors({ general: response.error || 'Terjadi kesalahan' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Gagal Mengubah Password', error.message || 'Terjadi kesalahan');
      setFormErrors({ general: error.message || 'Gagal mengubah password' });
    } finally {
      setSaving(false);
    }
  };

  return {
    // State
    loading,
    saving,
    user,
    formData,
    passwordData,
    showPasswords,
    formErrors,
    activeTab,
    // Setters
    setFormData,
    setPasswordData,
    setShowPasswords,
    setFormErrors,
    setActiveTab,
    // Handlers
    handleProfileSubmit,
    handlePasswordSubmit,
    fetchUser,
  };
}


