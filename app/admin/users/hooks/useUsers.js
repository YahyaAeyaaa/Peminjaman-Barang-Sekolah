import { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import { usersAPI } from '@/lib/api/users';

const initialFormData = {
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  role: 'PETUGAS', // Default untuk petugas (hanya bisa create PETUGAS)
  no_hp: '',
  alamat: '',
};

export function useUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterRole) params.role = filterRole;

      const response = await usersAPI.getAll(params);
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal Memuat Data', 'Terjadi kesalahan saat memuat data user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filterRole]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validasi
    if (!formData.email.trim()) {
      setFormErrors({ email: 'Email wajib diisi' });
      return;
    }

    if (!formData.first_name.trim()) {
      setFormErrors({ first_name: 'Nama depan wajib diisi' });
      return;
    }

    if (!formData.last_name.trim()) {
      setFormErrors({ last_name: 'Nama belakang wajib diisi' });
      return;
    }

    // Validasi password hanya untuk create (bukan edit)
    if (!editingUser && !formData.password) {
      setFormErrors({ password: 'Password wajib diisi' });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setFormErrors({ password: 'Password minimal 6 karakter' });
      return;
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormErrors({ email: 'Format email tidak valid' });
      return;
    }

    try {
      // Prepare payload
      const payload = {
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        role: editingUser ? formData.role : 'PETUGAS', // Saat create, selalu PETUGAS
        no_hp: formData.no_hp?.trim() || null,
        alamat: formData.alamat?.trim() || null,
      };

      // Hanya kirim password jika ada (untuk create atau update password)
      if (formData.password) {
        payload.password = formData.password;
      }

      const response = editingUser
        ? await usersAPI.update(editingUser.id, payload)
        : await usersAPI.create(payload);

      if (response.success) {
        toast.success(
          editingUser ? 'User Berhasil Diupdate' : 'User Berhasil Dibuat',
          editingUser ? 'Data user telah diperbarui' : 'User baru telah ditambahkan'
        );
        resetForm();
        fetchUsers();
      } else {
        toast.error('Gagal Menyimpan', response.error || 'Terjadi kesalahan saat menyimpan data');
        setFormErrors({ general: response.error || 'Terjadi kesalahan' });
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Gagal Menyimpan', error.message || 'Terjadi kesalahan saat menyimpan user');
      setFormErrors({ general: error.message || 'Gagal menyimpan user' });
    }
  };

  // Handle edit
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      password: '', // Kosongkan password saat edit
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.role || 'PETUGAS',
      no_hp: user.no_hp || '',
      alamat: user.alamat || '',
    });
    setShowPassword(false);
    setIsFormOpen(true);
  };

  // Handle delete
  const handleDelete = async (user) => {
    try {
      const response = await usersAPI.delete(user.id);

      if (response.success) {
        toast.success('User Berhasil Dihapus', 'Data user telah dihapus dari sistem');
        setDeleteConfirm(null);
        fetchUsers();
      } else {
        toast.error('Gagal Menghapus', response.error || 'Terjadi kesalahan saat menghapus user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Gagal Menghapus', error.message || 'Terjadi kesalahan saat menghapus user');
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (user) => {
    try {
      const response = await usersAPI.update(user.id, {
        is_active: !user.is_active,
      });

      if (response.success) {
        toast.success(
          user.is_active ? 'User Dinonaktifkan' : 'User Diaktifkan',
          `User telah ${user.is_active ? 'dinonaktifkan' : 'diaktifkan'}`
        );
        fetchUsers();
      } else {
        toast.error('Gagal Mengupdate', response.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Gagal Mengupdate', error.message || 'Terjadi kesalahan');
    }
  };

  // Reset form
  const resetForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    setFormData(initialFormData);
    setFormErrors({});
    setShowPassword(false);
  };

  // Get role badge color
  const getRoleBadge = (role) => {
    const roleMap = {
      ADMIN: 'bg-purple-50 text-purple-700 border border-purple-100',
      PETUGAS: 'bg-blue-50 text-blue-700 border border-blue-100',
      PEMINJAM: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    };
    return roleMap[role] || 'bg-gray-50 text-gray-700 border border-gray-100';
  };

  // Get role label
  const getRoleLabel = (role) => {
    const labelMap = {
      ADMIN: 'Admin',
      PETUGAS: 'Petugas',
      PEMINJAM: 'Peminjam',
    };
    return labelMap[role] || role;
  };

  return {
    // State
    users,
    loading,
    searchTerm,
    filterRole,
    isFormOpen,
    editingUser,
    formData,
    formErrors,
    deleteConfirm,
    showPassword,
    // Setters
    setSearchTerm,
    setFilterRole,
    setIsFormOpen,
    setFormData,
    setFormErrors,
    setDeleteConfirm,
    setShowPassword,
    // Handlers
    handleSubmit,
    handleEdit,
    handleDelete,
    handleToggleActive,
    resetForm,
    getRoleBadge,
    getRoleLabel,
  };
}

