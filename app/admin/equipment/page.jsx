'use client';

import { Plus, Edit2, Trash2, X, Save, Package } from 'lucide-react';
import Button from '@/components/button';
import ImageInput from '@/components/fileInput';
import SearchComponent from '@/components/search';
import FilterSelect from '@/components/filterSelect';
import { useEquipment } from './hooks/useEquipment';

export default function EquipmentPage() {
  const {
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
  } = useEquipment();

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
              Manajemen Alat
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola data alat yang tersedia untuk dipinjam
            </p>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            variant="primary"
            bgColor="#161b33"
            hoverColor="#111628"
            className="flex items-center gap-2 shadow-sm"
          >
            <Plus size={20} />
            Tambah Alat
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5 space-y-4">
          <SearchComponent
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Cari alat (nama, kode, deskripsi)..."
            size="small"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FilterSelect
              label="Filter Kategori"
              value={filterKategori}
              onChange={setFilterKategori}
              placeholder="Semua Kategori"
              options={categories.map((cat) => ({
                value: cat.id,
                label: cat.nama
              }))}
              size="small"
            />
            <FilterSelect
              label="Filter Status"
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="Semua Status"
              options={[
                { value: 'AVAILABLE', label: 'Tersedia' },
                { value: 'UNAVAILABLE', label: 'Tidak Tersedia' },
                { value: 'MAINTENANCE', label: 'Maintenance' }
              ]}
              size="small"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Memuat data...</div>
          ) : equipment.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {searchTerm || filterKategori || filterStatus
                ? 'Tidak ada alat yang ditemukan'
                : 'Belum ada alat'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Nama Alat
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Kode
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Harga Barang
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {equipment.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.gambar ? (
                            <img
                              src={item.gambar}
                              alt={item.nama}
                              className="h-10 w-10 rounded-lg object-cover bg-gray-100"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-600">
                              <Package size={18} />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{item.nama}</div>
                            {item.deskripsi && (
                              <div className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-xs">
                                {item.deskripsi}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 font-mono">
                          {item.kode_alat || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {item.kategori?.nama || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">{item.stok}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {item.harga_alat ? `Rp ${parseFloat(item.harga_alat).toLocaleString('id-ID')}` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-gray-400 hover:text-[#161b33] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingEquipment ? 'Edit Alat' : 'Tambah Alat'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingEquipment ? 'Ubah informasi alat' : 'Tambahkan alat baru ke sistem'}
                </p>
              </div>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg p-1 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {formErrors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {formErrors.general}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Alat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all ${
                      formErrors.nama ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Contoh: VGA RTX 3060"
                    required
                  />
                  {formErrors.nama && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.nama}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Alat
                  </label>
                  <input
                    type="text"
                    value={formData.kode_alat}
                    onChange={(e) => setFormData({ ...formData, kode_alat: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all"
                    placeholder="Contoh: VGA-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.kategori_id}
                    onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all bg-white ${
                      formErrors.kategori_id ? 'border-red-300' : 'border-gray-200'
                    }`}
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nama}
                      </option>
                    ))}
                  </select>
                  {formErrors.kategori_id && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.kategori_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stok}
                    onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all ${
                      formErrors.stok ? 'border-red-300' : 'border-gray-200'
                    }`}
                    required
                  />
                  {formErrors.stok && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.stok}</p>
                  )}
                </div>

                {/* Status hanya muncul saat edit */}
                {editingEquipment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status || 'AVAILABLE'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all bg-white"
                      required
                    >
                      <option value="AVAILABLE">Tersedia</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Status "Tidak Tersedia" otomatis jika stok = 0
                    </p>
                  </div>
                )}
                
                {/* Info status otomatis saat create */}
                {!editingEquipment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500">
                      {formData.stok > 0 ? 'Tersedia' : 'Tidak Tersedia'} (Otomatis dari stok)
                    </div>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <ImageInput
                    label="Gambar Alat"
                    value={null}
                    onChange={handleImageChange}
                    existingImageUrl={imagePreview || editingEquipment?.gambar || null}
                    id="equipment-image-upload"
                    maxSizeMB={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Barang (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.harga_barang}
                    onChange={(e) => setFormData({ ...formData, harga_barang: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all resize-none"
                    placeholder="Deskripsi alat (opsional)"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleTagInputKeyPress}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all"
                        placeholder="Masukkan tag dan tekan Enter atau klik Tambah"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddTag}
                        disabled={!tagInput.trim() || formData.tags.includes(tagInput.trim())}
                      >
                        Tambah
                      </Button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200 min-h-[3rem]">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="text-gray-400 hover:text-red-600 ml-1 transition-colors"
                              title="Hapus tag"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Tags membantu pengguna menemukan alat dengan lebih mudah. Contoh: gaming, high-performance, nvidia
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="submit"
                  variant="primary"
                  bgColor="#161b33"
                  hoverColor="#111628"
                  className="flex-1 flex items-center justify-center gap-2"
                  disabled={uploadingImage}
                  loading={uploadingImage}
                >
                  <Save size={18} />
                  {uploadingImage ? 'Mengupload...' : editingEquipment ? 'Update' : 'Simpan'}
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
                Hapus Alat?
              </h2>
              <p className="text-gray-600 mb-1">
                Apakah Anda yakin ingin menghapus alat <strong>{deleteConfirm.nama}</strong>?
              </p>
              {deleteConfirm._count?.loans > 0 && (
                <p className="text-sm text-red-600 mt-3 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
                  Alat ini masih digunakan dalam {deleteConfirm._count.loans} peminjaman. Selesaikan peminjaman terlebih dahulu sebelum menghapus alat.
                </p>
              )}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => handleDelete(deleteConfirm)}
                  variant="danger"
                  className="flex-1"
                  disabled={deleteConfirm._count?.loans > 0}
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
