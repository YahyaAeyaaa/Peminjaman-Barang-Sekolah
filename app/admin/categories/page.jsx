'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Save, Eye, Upload, FileSpreadsheet, Download } from 'lucide-react';
import Button from '@/components/button';
import SearchComponent from '@/components/search';
import { categoriesAPI } from '@/lib/api/categories';
import { equipmentAPI } from '@/lib/api/equipment';
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryEquipment, setCategoryEquipment] = useState([]);
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const fileInputRef = useRef(null);

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

  // Handle view category details
  const handleViewCategory = async (category) => {
    setSelectedCategory(category);
    setLoadingEquipment(true);
    try {
      const response = await equipmentAPI.getAll({ kategori_id: category.id });
      if (response.success) {
        setCategoryEquipment(response.data);
      } else {
        toast.error('Gagal Memuat Data', response.error || 'Terjadi kesalahan saat memuat data alat');
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error('Gagal Memuat Data', error.message || 'Terjadi kesalahan saat memuat data alat');
    } finally {
      setLoadingEquipment(false);
    }
  };

  // Close category detail modal
  const closeCategoryDetail = () => {
    setSelectedCategory(null);
    setCategoryEquipment([]);
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Format file tidak didukung', 'Gunakan file Excel (.xlsx, .xls) atau CSV (.csv)');
        return;
      }
      
      setImportFile(file);
    }
  };

  // Handle import submit
  const handleImportSubmit = async () => {
    if (!importFile) {
      toast.error('Pilih file terlebih dahulu', 'Silakan pilih file Excel yang akan diimport');
      return;
    }

    setImporting(true);
    try {
      const response = await categoriesAPI.import(importFile);

      if (response.success) {
        toast.success(
          'Import Berhasil',
          `Berhasil mengimport ${response.data.created} kategori${response.data.skipped > 0 ? `, ${response.data.skipped} data dilewati` : ''}`
        );
        setImportModalOpen(false);
        setImportFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchCategories();
      } else {
        toast.error('Gagal Import', response.error || 'Terjadi kesalahan saat mengimport data');
      }
    } catch (error) {
      console.error('Error importing categories:', error);
      toast.error('Gagal Import', error.message || 'Terjadi kesalahan saat mengimport data');
    } finally {
      setImporting(false);
    }
  };

  // Handle download template
  const handleDownloadTemplate = () => {
    // Create template Excel data
    const templateData = [
      ['nama', 'deskripsi'],
      ['VGA', 'Kartu grafis untuk komputer'],
      ['RAM', 'Random Access Memory'],
      ['Processor', 'Central Processing Unit'],
    ];

    // Create workbook
    const XLSX = require('xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, 'Kategori');

    // Download file
    XLSX.writeFile(wb, 'template-import-kategori.xlsx');
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

        <div className="flex items-center justify-between gap-4">
          <SearchComponent
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Cari kategori..."
            size="small"
            className="flex-1"
          />
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setImportModalOpen(true)}
              variant="outline"
              className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
              radius="xl"
              size="sm"
            >
              <Upload size={18} />
              Import Excel
            </Button>
            
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
                onClick={() => handleViewCategory(category)}
                className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-[2px] cursor-pointer"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(category);
                      }}
                      className="p-2 text-gray-400 hover:text-[#161b33] hover:bg-gray-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(category);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {category._count?.equipment || 0} alat
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Eye size={14} />
                    Lihat detail
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

      {/* Category Detail Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Detail Kategori: {selectedCategory.nama}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedCategory.deskripsi || 'Tidak ada deskripsi'}
                </p>
              </div>
              <button
                onClick={closeCategoryDetail}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg p-1 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingEquipment ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Memuat data alat...</p>
                </div>
              ) : categoryEquipment.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Belum ada alat pada kategori ini</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {categoryEquipment.map((equipment) => (
                    <div
                      key={equipment.id}
                      className="rounded-xl bg-gray-50 border border-gray-200 p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {equipment.nama}
                          </h3>
                          {equipment.kode_alat && (
                            <p className="text-xs text-gray-500 mb-2">
                              Kode: {equipment.kode_alat}
                            </p>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                            equipment.status === 'AVAILABLE'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : equipment.status === 'UNAVAILABLE'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}
                        >
                          {equipment.status === 'AVAILABLE'
                            ? 'Tersedia'
                            : equipment.status === 'UNAVAILABLE'
                            ? 'Tidak Tersedia'
                            : 'Maintenance'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Stok:</span>
                          <span className="font-medium text-gray-900">{equipment.stok}</span>
                        </div>
                        {equipment.harga_sewa && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Harga Sewa:</span>
                            <span className="font-medium text-gray-900">
                              Rp {parseFloat(equipment.harga_sewa).toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}
                        {equipment.deskripsi && (
                          <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                            {equipment.deskripsi}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Total: <span className="font-medium text-gray-900">{categoryEquipment.length} alat</span>
              </p>
              <Button
                onClick={closeCategoryDetail}
                variant="outline"
                className="border-gray-200 hover:bg-gray-50"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Import Kategori dari Excel
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Upload file Excel untuk menambahkan kategori secara massal
                </p>
              </div>
              <button
                onClick={() => {
                  setImportModalOpen(false);
                  setImportFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg p-1 transition-colors"
                disabled={importing}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Download Template */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="text-blue-600 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Format File Excel
                    </p>
                    <p className="text-xs text-blue-700 mb-3">
                      Kolom A: Nama Kategori (wajib)<br />
                      Kolom B: Deskripsi (opsional)
                    </p>
                    <button
                      onClick={handleDownloadTemplate}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <Download size={14} />
                      Download Template Excel
                    </button>
                  </div>
                </div>
              </div>

              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih File Excel <span className="text-red-500">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                  disabled={importing}
                />
                {importFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    File terpilih: <span className="font-medium">{importFile.name}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleImportSubmit}
                  variant="primary"
                  bgColor="#161b33"
                  hoverColor="#111628"
                  className="flex-1 flex items-center justify-center gap-2"
                  disabled={!importFile || importing}
                  loading={importing}
                >
                  <Upload size={18} />
                  {importing ? 'Mengimport...' : 'Import Data'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setImportModalOpen(false);
                    setImportFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                  disabled={importing}
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

