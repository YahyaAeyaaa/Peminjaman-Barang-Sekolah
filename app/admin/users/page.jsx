'use client';

import { Plus, Edit2, Trash2, X, Save, Users, Eye, EyeOff, Power } from 'lucide-react';
import Button from '@/components/button';
import SearchComponent from '@/components/search';
import FilterSelect from '@/components/filterSelect';
import Input from '@/components/forminput';
import { useUsers } from './hooks/useUsers';

export default function UsersPage() {
  const {
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
  } = useUsers();

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
              Manajemen User
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola akun petugas dan peminjam di sistem
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
            Tambah User
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5 space-y-4">
          <SearchComponent
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Cari user (email, nama)..."
            size="small"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FilterSelect
              label="Filter Role"
              value={filterRole}
              onChange={setFilterRole}
              placeholder="Semua Role"
              options={[
                { value: 'ADMIN', label: 'Admin' },
                { value: 'PETUGAS', label: 'Petugas' },
                { value: 'PEMINJAM', label: 'Peminjam' },
              ]}
              size="small"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Memuat data...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {searchTerm || filterRole
                ? 'Tidak ada user yang ditemukan'
                : 'Belum ada user'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Peminjaman
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#161b33] text-white font-semibold">
                            <Users size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            {user.no_hp && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {user.no_hp}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            user.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}
                        >
                          {user.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {user._count?.loans || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(user)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.is_active
                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            <Power size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-gray-400 hover:text-[#161b33] hover:bg-gray-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(user)}
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
                  {editingUser ? 'Edit User' : 'Tambah User Petugas'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingUser
                    ? 'Ubah informasi user'
                    : 'Buat akun baru untuk petugas (hanya role Petugas)'}
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
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all ${
                    formErrors.email ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="email@example.com"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {!editingUser && <span className="text-red-500">*</span>}
                  {editingUser && (
                    <span className="text-gray-400 text-xs font-normal ml-2">
                      (Kosongkan jika tidak ingin mengubah)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#161b33] focus:border-transparent transition-all pr-10 ${
                      formErrors.password ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder={editingUser ? 'Password baru (opsional)' : 'Minimal 6 karakter'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                {editingUser ? (
                  <FilterSelect
                    value={formData.role}
                    onChange={(value) => setFormData({ ...formData, role: value })}
                    options={[
                      { value: 'PETUGAS', label: 'Petugas' },
                      { value: 'PEMINJAM', label: 'Peminjam' },
                    ]}
                    placeholder="Pilih role"
                  />
                ) : (
                  <div>
                    <FilterSelect
                      value={formData.role}
                      onChange={(value) => setFormData({ ...formData, role: value })}
                      options={[
                        { value: 'PETUGAS', label: 'Petugas' },
                      ]}
                      placeholder="Pilih role"
                      disabled={true}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Hanya bisa membuat akun dengan role Petugas
                    </p>
                  </div>
                )}
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
                  {editingUser ? 'Update' : 'Simpan'}
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
                Hapus User?
              </h2>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus user{' '}
                <span className="font-semibold">
                  {deleteConfirm.first_name} {deleteConfirm.last_name}
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
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

