import { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import { profileAPI } from '@/lib/api/profile';

const initialFormData = {
  first_name: '',
  last_name: '',
  email: '',
  no_hp: '',
  alamat: '',
  avatar: '',
};

export function useProfileUser() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

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
          avatar: data.user.avatar || '',
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

  // Handle profile submit (hanya field yang boleh diubah peminjam)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validasi sederhana
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
        avatar: formData.avatar || null,
      });

      if (response.success) {
        toast.success('Profil Berhasil Diupdate', 'Data profil peminjam telah diperbarui');
        await fetchUser(); // Refresh data dari server
        // Refresh session next-auth supaya navbar ikut update
        try {
          await fetch('/api/auth/session?update', { cache: 'no-store' });
        } catch (err) {
          console.error('Error refreshing session:', err);
        }
      } else {
        toast.error(
          'Gagal Mengupdate',
          response.error || 'Terjadi kesalahan saat mengupdate profil'
        );
        setFormErrors({ general: response.error || 'Terjadi kesalahan' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(
        'Gagal Mengupdate',
        error.message || 'Terjadi kesalahan saat mengupdate profil'
      );
      setFormErrors({ general: error.message || 'Gagal mengupdate profil' });
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    user,
    formData,
    formErrors,
    setFormData,
    setFormErrors,
    handleProfileSubmit,
  };
}


