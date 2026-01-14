import { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import { equipmentAPI } from '@/lib/api/equipment';
import { categoriesAPI } from '@/lib/api/categories';
import { uploadAPI } from '@/lib/api/upload';

const initialFormData = {
  nama: '',
  kode_alat: '',
  kategori_id: '',
  stok: 0,
  status: 'AVAILABLE',
  gambar: '',
  harga_sewa: '',
  harga_alat: '',
  deskripsi: '',
  tags: [],
};

export function useEquipment() {
  const toast = useToast();
  const [equipment, setEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch equipment
  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterKategori) params.kategori_id = filterKategori;
      if (filterStatus) params.status = filterStatus;

      const response = await equipmentAPI.getAll(params);
      if (response.success) {
        setEquipment(response.data);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error('Gagal Memuat Data', 'Terjadi kesalahan saat memuat data alat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEquipment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterKategori, filterStatus]);

  // Upload image
  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      const response = await uploadAPI.uploadImage(file);
      if (response.success) {
        return response.data.url;
      } else {
        throw new Error(response.error || 'Gagal mengupload gambar');
      }
    } catch (error) {
      throw new Error(error.message || 'Gagal mengupload gambar');
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setUploadingImage(true);

    // Validasi
    if (!formData.nama.trim()) {
      setFormErrors({ nama: 'Nama alat wajib diisi' });
      setUploadingImage(false);
      return;
    }

    if (!formData.kategori_id) {
      setFormErrors({ kategori_id: 'Kategori wajib dipilih' });
      setUploadingImage(false);
      return;
    }

    if (formData.stok < 0) {
      setFormErrors({ stok: 'Stok tidak boleh negatif' });
      setUploadingImage(false);
      return;
    }

    try {
      // Upload gambar jika ada file baru
      let imageUrl = formData.gambar;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Prepare data untuk dikirim
      const payload = {
        ...formData,
        stok: parseInt(formData.stok) || 0,
        harga_sewa: formData.harga_sewa ? parseFloat(formData.harga_sewa) : null,
        harga_alat: formData.harga_alat ? parseFloat(formData.harga_alat) : null,
        kode_alat: formData.kode_alat?.trim() || null,
        gambar: imageUrl?.trim() || null,
        deskripsi: formData.deskripsi?.trim() || null,
        tags: Array.isArray(formData.tags) ? formData.tags : [],
      };

      const response = editingEquipment
        ? await equipmentAPI.update(editingEquipment.id, payload)
        : await equipmentAPI.create(payload);

      if (response.success) {
        toast.success(
          editingEquipment ? 'Alat Berhasil Diupdate' : 'Alat Berhasil Dibuat',
          editingEquipment ? 'Data alat telah diperbarui' : 'Alat baru telah ditambahkan'
        );
        resetForm();
        fetchEquipment();
      } else {
        toast.error('Gagal Menyimpan', response.error || 'Terjadi kesalahan saat menyimpan data');
        setFormErrors({ general: response.error || 'Terjadi kesalahan' });
      }
    } catch (error) {
      console.error('Error saving equipment:', error);
      toast.error('Gagal Menyimpan', error.message || 'Terjadi kesalahan saat menyimpan alat');
      setFormErrors({ general: error.message || 'Gagal menyimpan alat' });
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditingEquipment(item);
    setFormData({
      nama: item.nama || '',
      kode_alat: item.kode_alat || '',
      kategori_id: item.kategori_id || '',
      stok: item.stok || 0,
      status: item.status || 'AVAILABLE',
      gambar: item.gambar || '',
      harga_sewa: item.harga_sewa ? item.harga_sewa.toString() : '',
      harga_alat: item.harga_alat ? item.harga_alat.toString() : '',
      deskripsi: item.deskripsi || '',
      tags: Array.isArray(item.tags) ? item.tags : [],
    });
    setTagInput('');
    setImageFile(null);
    setImagePreview(item.gambar || null);
    setIsFormOpen(true);
  };

  // Handle delete
  const handleDelete = async (item) => {
    try {
      const response = await equipmentAPI.delete(item.id);

      if (response.success) {
        toast.success('Alat Berhasil Dihapus', 'Data alat telah dihapus dari sistem');
        setDeleteConfirm(null);
        fetchEquipment();
      } else {
        toast.error('Gagal Menghapus', response.error || 'Terjadi kesalahan saat menghapus alat');
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast.error('Gagal Menghapus', error.message || 'Terjadi kesalahan saat menghapus alat');
    }
  };

  // Reset form
  const resetForm = () => {
    setIsFormOpen(false);
    setEditingEquipment(null);
    setFormData(initialFormData);
    setTagInput('');
    setImageFile(null);
    setImagePreview(null);
    setFormErrors({});
  };

  // Handle image change
  const handleImageChange = (file, preview) => {
    setImageFile(file);
    setImagePreview(preview);
  };

  // Handle add tag
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  // Handle remove tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  // Handle tag input keypress
  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusMap = {
      AVAILABLE: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
      UNAVAILABLE: 'bg-red-50 text-red-700 border border-red-100',
      MAINTENANCE: 'bg-amber-50 text-amber-700 border border-amber-100',
    };
    return statusMap[status] || 'bg-gray-50 text-gray-700 border border-gray-100';
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labelMap = {
      AVAILABLE: 'Tersedia',
      UNAVAILABLE: 'Tidak Tersedia',
      MAINTENANCE: 'Maintenance',
    };
    return labelMap[status] || status;
  };

  return {
    // State
    equipment,
    categories,
    loading,
    searchTerm,
    filterKategori,
    filterStatus,
    isFormOpen,
    editingEquipment,
    formData,
    tagInput,
    formErrors,
    deleteConfirm,
    imagePreview,
    uploadingImage,
    // Setters
    setSearchTerm,
    setFilterKategori,
    setFilterStatus,
    setIsFormOpen,
    setFormData,
    setTagInput,
    setFormErrors,
    setDeleteConfirm,
    // Handlers
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    handleImageChange,
    handleAddTag,
    handleRemoveTag,
    handleTagInputKeyPress,
    getStatusBadge,
    getStatusLabel,
  };
}

