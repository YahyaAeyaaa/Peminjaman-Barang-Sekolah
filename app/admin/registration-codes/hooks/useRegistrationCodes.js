import { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import { registrationCodesAPI } from '@/lib/api/registrationCodes';

const initialFormData = {
  code: '',
  keterangan: '',
  max_usage: 0, // 0 = unlimited
  expire_date: '',
  status: 'AKTIF',
};

export function useRegistrationCodes() {
  const toast = useToast();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [autoGenerate, setAutoGenerate] = useState(true);

  // Generate kode otomatis
  const generateCode = () => {
    const prefix = 'REG';
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${year}-${random}`;
  };

  // Fetch codes
  const fetchCodes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus) params.status = filterStatus;

      const response = await registrationCodesAPI.getAll(params);
      if (response.success) {
        setCodes(response.data);
      }
    } catch (error) {
      console.error('Error fetching registration codes:', error);
      toast.error('Gagal Memuat Data', 'Terjadi kesalahan saat memuat data kode registrasi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [searchTerm, filterStatus]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validasi
    if (!formData.code.trim() && !autoGenerate) {
      setFormErrors({ code: 'Kode registrasi wajib diisi' });
      return;
    }

    if (formData.max_usage < 0) {
      setFormErrors({ max_usage: 'Max usage tidak boleh negatif' });
      return;
    }

    try {
      // Prepare payload
      const payload = {
        code: autoGenerate ? generateCode() : formData.code.trim().toUpperCase(),
        keterangan: formData.keterangan?.trim() || null,
        max_usage: parseInt(formData.max_usage) || 0,
        expire_date: formData.expire_date || null,
        status: formData.status,
      };

      const response = editingCode
        ? await registrationCodesAPI.update(editingCode.id, payload)
        : await registrationCodesAPI.create(payload);

      if (response.success) {
        toast.success(
          editingCode ? 'Kode Berhasil Diupdate' : 'Kode Berhasil Dibuat',
          editingCode ? 'Data kode telah diperbarui' : 'Kode registrasi baru telah ditambahkan'
        );
        resetForm();
        fetchCodes();
      } else {
        toast.error('Gagal Menyimpan', response.error || 'Terjadi kesalahan saat menyimpan data');
        setFormErrors({ general: response.error || 'Terjadi kesalahan' });
      }
    } catch (error) {
      console.error('Error saving registration code:', error);
      toast.error('Gagal Menyimpan', error.message || 'Terjadi kesalahan saat menyimpan kode');
      setFormErrors({ general: error.message || 'Gagal menyimpan kode' });
    }
  };

  // Handle edit
  const handleEdit = (code) => {
    setEditingCode(code);
    setFormData({
      code: code.code || '',
      keterangan: code.keterangan || '',
      max_usage: code.max_usage || 0,
      expire_date: code.expire_date ? new Date(code.expire_date).toISOString().split('T')[0] : '',
      status: code.status || 'AKTIF',
    });
    setAutoGenerate(false); // Saat edit, tidak auto generate
    setIsFormOpen(true);
  };

  // Handle delete
  const handleDelete = async (code) => {
    try {
      const response = await registrationCodesAPI.delete(code.id);

      if (response.success) {
        toast.success('Kode Berhasil Dihapus', 'Data kode telah dihapus dari sistem');
        setDeleteConfirm(null);
        fetchCodes();
      } else {
        toast.error('Gagal Menghapus', response.error || 'Terjadi kesalahan saat menghapus kode');
      }
    } catch (error) {
      console.error('Error deleting registration code:', error);
      toast.error('Gagal Menghapus', error.message || 'Terjadi kesalahan saat menghapus kode');
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (code) => {
    try {
      const newStatus = code.status === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';
      const response = await registrationCodesAPI.update(code.id, {
        status: newStatus,
      });

      if (response.success) {
        toast.success(
          newStatus === 'AKTIF' ? 'Kode Diaktifkan' : 'Kode Dinonaktifkan',
          `Kode registrasi telah ${newStatus === 'AKTIF' ? 'diaktifkan' : 'dinonaktifkan'}`
        );
        fetchCodes();
      } else {
        toast.error('Gagal Mengupdate', response.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error toggling code status:', error);
      toast.error('Gagal Mengupdate', error.message || 'Terjadi kesalahan');
    }
  };

  // Reset form
  const resetForm = () => {
    setIsFormOpen(false);
    setEditingCode(null);
    setFormData(initialFormData);
    setFormErrors({});
    setAutoGenerate(true);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusMap = {
      AKTIF: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
      NONAKTIF: 'bg-gray-50 text-gray-700 border border-gray-100',
      EXPIRED: 'bg-red-50 text-red-700 border border-red-100',
    };
    return statusMap[status] || 'bg-gray-50 text-gray-700 border border-gray-100';
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labelMap = {
      AKTIF: 'Aktif',
      NONAKTIF: 'Nonaktif',
      EXPIRED: 'Kadaluarsa',
    };
    return labelMap[status] || status;
  };

  // Check if code is expired
  const isExpired = (code) => {
    if (!code.expire_date) return false;
    return new Date(code.expire_date) < new Date();
  };

  // Check if code is fully used
  const isFullyUsed = (code) => {
    if (code.max_usage === 0) return false; // Unlimited
    return code.used_count >= code.max_usage;
  };

  return {
    // State
    codes,
    loading,
    searchTerm,
    filterStatus,
    isFormOpen,
    editingCode,
    formData,
    formErrors,
    deleteConfirm,
    autoGenerate,
    // Setters
    setSearchTerm,
    setFilterStatus,
    setIsFormOpen,
    setFormData,
    setFormErrors,
    setDeleteConfirm,
    setAutoGenerate,
    // Handlers
    handleSubmit,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    resetForm,
    generateCode,
    getStatusBadge,
    getStatusLabel,
    isExpired,
    isFullyUsed,
  };
}



