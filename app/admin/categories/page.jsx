'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import Button from '@/components/button';
import SearchComponent from '@/components/search';
import { categoriesAPI } from '@/lib/api/categories';
import { useToast } from '@/components/ToastProvider';

export default function CategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll({ search: searchTerm });
      
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Gagal Memuat Data', error.message || 'Terjadi kesalahan saat memuat data kategori');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validasi
    if (!formData.nama.trim()) {
      setFormErrors({ nama: 'Nama kategori wajib diisi' });
      return;
    }

    try {
      const response = editingCategory
        ? await categoriesAPI.update(editingCategory.id, formData)
        : await categoriesAPI.create(formData);

      if (response.success) {
        toast.success(
          editingCategory ? 'Kategori Berhasil Diupdate' : 'Kategori Berhasil Dibuat',
          editingCategory ? 'Data kategori telah diperbarui' : 'Kategori baru telah ditambahkan'
        );
        setIsFormOpen(false);
        setEditingCategory(null);
        setFormData({ nama: '', deskripsi: '' });
        fetchCategories();
      } else {
        setFormErrors({ general: response.error || 'Terjadi kesalahan' });
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Gagal Menyimpan', error.message || 'Terjadi kesalahan saat menyimpan kategori');
      setFormErrors({ general: error.message || 'Gagal menyimpan kategori' });
    }
  };

  // Handle edit
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      nama: category.nama,
      deskripsi: category.deskripsi || '',
    });
    setIsFormOpen(true);
  };

  // Handle delete
  const handleDelete = async (category) => {
    try {
      const response = await categoriesAPI.delete(category.id);

      if (response.success) {
        toast.success('Kategori Berhasil Dihapus', 'Data kategori telah dihapus dari sistem');
        setDeleteConfirm(null);
        fetchCategories();
      } else {
        toast.error('Gagal Menghapus', response.error || 'Terjadi kesalahan saat menghapus kategori');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Gagal Menghapus', error.message || 'Terjadi kesalahan saat menghapus kategori');
    }
  };

  // Reset form
  const resetForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormData({ nama: '', deskripsi: '' });
    setFormErrors({});
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-2">
              Admin • Manajemen
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
              Manajemen Kategori
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola kategori alat yang tersedia di sistem
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <SearchComponent
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Cari kategori..."
            size="small"
            className="w-1/2"
          />
          
          <Button
            onClick={() => setIsFormOpen(true)}
            variant="primary"
            bgColor="#161b33"
            hoverColor="#111628"
            className="flex items-center gap-2 shadow-sm"
            radius="xl" 
            size="sm"
          >
            <Plus size={20} />
            Tambah Kategori
          </Button>
          </div>
        {/* Search Bar */}

        {/* Cards Grid */}
        {loading ? (
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'Tidak ada kategori yang ditemukan' : 'Belum ada kategori'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-[2px]"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {category.nama}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {category.deskripsi || 'Tidak ada deskripsi'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-gray-400 hover:text-[#161b33] hover:bg-gray-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(category)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {category._count?.equipment || 0} alat
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingCategory ? 'Ubah informasi kategori' : 'Buat kategori baru untuk alat'}
                </p>
              </div>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg p-1 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formErrors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {formErrors.general}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all ${
                    formErrors.nama ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Contoh: VGA, RAM, Processor"
                  required
                />
                {formErrors.nama && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.nama}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all resize-none"
                  placeholder="Deskripsi kategori (opsional)"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  bgColor="#161b33"
                  hoverColor="#111628"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingCategory ? 'Update' : 'Simpan'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Hapus Kategori?
              </h2>
              <p className="text-gray-600 mb-1">
                Apakah Anda yakin ingin menghapus kategori <strong>{deleteConfirm.nama}</strong>?
              </p>
              {deleteConfirm._count?.equipment > 0 && (
                <p className="text-sm text-red-600 mt-3 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
                  Kategori ini masih digunakan oleh {deleteConfirm._count.equipment} alat. Hapus alat terlebih dahulu sebelum menghapus kategori.
                </p>
              )}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => handleDelete(deleteConfirm)}
                  variant="danger"
                  className="flex-1"
                  disabled={deleteConfirm._count?.equipment > 0}
                >
                  Hapus
                </Button>
                <Button
                  onClick={() => setDeleteConfirm(null)}
                  variant="outline"
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

