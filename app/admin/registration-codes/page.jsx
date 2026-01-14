'use client';

import { Plus, Edit2, Trash2, X, Save, KeyRound, Power, Copy, Check } from 'lucide-react';
import Button from '@/components/button';
import SearchComponent from '@/components/search';
import FilterSelect from '@/components/filterSelect';
import { useRegistrationCodes } from './hooks/useRegistrationCodes';
import { useState } from 'react';

export default function RegistrationCodesPage() {
  const {
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
  } = useRegistrationCodes();

  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
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
              Kode Registrasi
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola kode registrasi untuk verifikasi pendaftaran user baru
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
            Tambah Kode
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5 space-y-4">
          <SearchComponent
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Cari kode registrasi..."
            size="small"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FilterSelect
              label="Filter Status"
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="Semua Status"
              options={[
                { value: 'AKTIF', label: 'Aktif' },
                { value: 'NONAKTIF', label: 'Nonaktif' },
                { value: 'EXPIRED', label: 'Kadaluarsa' },
              ]}
              size="small"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Memuat data...</div>
          ) : codes.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {searchTerm || filterStatus
                ? 'Tidak ada kode yang ditemukan'
                : 'Belum ada kode registrasi'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Kode
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Keterangan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Penggunaan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Expire Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Dibuat Oleh
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {codes.map((code) => (
                    <tr key={code.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#161b33] text-white">
                            <KeyRound size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 font-mono">
                              {code.code}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(code.created_at).toLocaleDateString('id-ID')}
                            </div>
                          </div>
                          <button
                            onClick={() => handleCopyCode(code.code)}
                            className="ml-2 p-1.5 text-gray-400 hover:text-[#161b33] hover:bg-gray-100 rounded transition-colors"
                            title="Copy kode"
                          >
                            {copiedCode === code.code ? (
                              <Check size={16} className="text-emerald-600" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {code.keterangan || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {code.used_count} / {code.max_usage === 0 ? '∞' : code.max_usage}
                        </div>
                        {isFullyUsed(code) && (
                          <div className="text-xs text-red-600 mt-0.5">Sudah penuh</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {code.expire_date
                            ? new Date(code.expire_date).toLocaleDateString('id-ID')
                            : 'Tidak ada'}
                        </div>
                        {isExpired(code) && (
                          <div className="text-xs text-red-600 mt-0.5">Kadaluarsa</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(
                            code.status
                          )}`}
                        >
                          {getStatusLabel(code.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {code.creator?.first_name} {code.creator?.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {code.creator?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(code)}
                            className={`p-2 rounded-lg transition-colors ${
                              code.status === 'AKTIF'
                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={code.status === 'AKTIF' ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            <Power size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(code)}
                            className="p-2 text-gray-400 hover:text-[#161b33] hover:bg-gray-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(code)}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingCode ? 'Edit Kode Registrasi' : 'Tambah Kode Registrasi'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingCode
                    ? 'Ubah informasi kode registrasi'
                    : 'Buat kode baru untuk verifikasi pendaftaran'}
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

              {!editingCode && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="autoGenerate"
                    checked={autoGenerate}
                    onChange={(e) => {
                      setAutoGenerate(e.target.checked);
                      if (e.target.checked) {
                        setFormData({ ...formData, code: '' });
                      }
                    }}
                    className="w-4 h-4 text-[#161b33] border-gray-300 rounded focus:ring-[#161b33]"
                  />
                  <label htmlFor="autoGenerate" className="text-sm text-gray-700 cursor-pointer">
                    Generate kode otomatis
                  </label>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Registrasi {!autoGenerate && <span className="text-red-500">*</span>}
                </label>
                {autoGenerate && !editingCode ? (
                  <div className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500">
                    {generateCode()} (akan di-generate otomatis)
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all font-mono ${
                      formErrors.code ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="REG-2024-XXXXXX"
                    disabled={autoGenerate && !editingCode}
                  />
                )}
                {formErrors.code && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keterangan
                </label>
                <input
                  type="text"
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all"
                  placeholder="Contoh: Untuk kelas X-1 A"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Usage
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.max_usage}
                    onChange={(e) =>
                      setFormData({ ...formData, max_usage: parseInt(e.target.value) || 0 })
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all ${
                      formErrors.max_usage ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="0 = unlimited"
                  />
                  {formErrors.max_usage && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.max_usage}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">0 = tidak terbatas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <FilterSelect
                    value={formData.status}
                    onChange={(value) => setFormData({ ...formData, status: value })}
                    options={[
                      { value: 'AKTIF', label: 'Aktif' },
                      { value: 'NONAKTIF', label: 'Nonaktif' },
                    ]}
                    placeholder="Pilih status"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expire Date
                </label>
                <input
                  type="date"
                  value={formData.expire_date}
                  onChange={(e) =>
                    setFormData({ ...formData, expire_date: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ada batas waktu</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="secondary"
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  bgColor="#161b33"
                  hoverColor="#111628"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingCode ? 'Update' : 'Simpan'}
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
                Hapus Kode Registrasi?
              </h2>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus kode{' '}
                <span className="font-semibold font-mono">{deleteConfirm.code}</span>? Tindakan ini
                tidak dapat dibatalkan.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  variant="secondary"
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={() => handleDelete(deleteConfirm)}
                  variant="danger"
                  className="flex-1"
                >
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



