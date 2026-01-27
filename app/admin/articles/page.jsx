'use client';

import { Plus, Edit2, Trash2, X, Save, FileText } from 'lucide-react';
import Button from '@/components/button';
import SearchComponent from '@/components/search';
import FilterSelect from '@/components/filterSelect';
import Input from '@/components/forminput';
import ImageInput from '@/components/fileInput';
import { useArticles } from './hooks/useArticles';

export default function ArticlesPage() {
  const {
    // State
    articles,
    loading,
    searchTerm,
    filterStatus,
    isFormOpen,
    editingArticle,
    formData,
    tagInput,
    formErrors,
    deleteConfirm,
    imagePreview,
    uploadingImage,
    // Setters
    setSearchTerm,
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
    handleAddTag,
    handleRemoveTag,
    handleTagInputKeyPress,
    handleImageChange,
    getStatusBadge,
    getStatusLabel,
  } = useArticles();

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
              Manajemen Artikel
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola artikel, pengumuman, dan berita untuk pengguna
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            variant="primary"
            bgColor="#161b33"
            hoverColor="#111628"
            className="flex items-center gap-2 shadow-sm"
          >
            <Plus size={20} />
            Tambah Artikel
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5 space-y-4">
          <SearchComponent
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Cari artikel (judul, konten)..."
            size="small"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FilterSelect
              label="Filter Status"
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="Semua Status"
              options={[
                { value: 'DRAFT', label: 'Draft' },
                { value: 'PUBLISHED', label: 'Published' },
                { value: 'ARCHIVED', label: 'Archived' },
              ]}
              size="small"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Memuat data...</div>
          ) : articles.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {searchTerm || filterStatus
                ? 'Tidak ada artikel yang ditemukan'
                : 'Belum ada artikel'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Judul
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {article.thumbnail ? (
                            <img
                              src={article.thumbnail}
                              alt={article.judul}
                              className="h-10 w-10 rounded-lg object-cover bg-gray-100"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-600">
                              <FileText size={18} />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{article.judul}</div>
                            {article.excerpt && (
                              <div className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-xs">
                                {article.excerpt}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {article.author
                            ? `${article.author.first_name} ${article.author.last_name}`
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                            article.status
                          )}`}
                        >
                          {getStatusLabel(article.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">{article.view_count || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {article.published_at
                            ? new Date(article.published_at).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(article)}
                            className="p-2 text-gray-400 hover:text-[#161b33] hover:bg-gray-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(article)}
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

        {/* Form Modal */}
        {isFormOpen && (
          <div  className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-50 flex items-center justify-center p-4"
          style={{ margin: 0, padding: 0 }}>
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingArticle ? 'Edit Artikel' : 'Tambah Artikel Baru'}
                </h2>
                <button
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {formErrors.general && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {formErrors.general}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Artikel <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="judul"
                    value={formData.judul}
                    onChange={(e) =>
                      setFormData({ ...formData, judul: e.target.value })
                    }
                    placeholder="Masukkan judul artikel"
                    error={formErrors.judul}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konten <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="konten"
                    value={formData.konten}
                    onChange={(e) =>
                      setFormData({ ...formData, konten: e.target.value })
                    }
                    placeholder="Masukkan konten artikel (minimal 50 karakter)"
                    rows={10}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#161b33] focus:border-transparent resize-y ${
                      formErrors.konten ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.konten && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.konten}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.konten.length} karakter
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt (Ringkasan)
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    placeholder="Masukkan ringkasan artikel (opsional)"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#161b33] focus:border-transparent resize-y"
                  />
                </div>

                <div>
                  <ImageInput
                    label="Thumbnail Artikel"
                    value={null}
                    onChange={handleImageChange}
                    existingImageUrl={imagePreview || editingArticle?.thumbnail || null}
                    id="article-thumbnail-upload"
                    maxSizeMB={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInputKeyPress}
                      placeholder="Masukkan tag dan tekan Enter"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      variant="secondary"
                      className="whitespace-nowrap"
                    >
                      Tambah
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-100"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#161b33] focus:border-transparent"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      resetForm();
                    }}
                    variant="secondary"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    bgColor="#161b33"
                    hoverColor="#111628"
                    className="flex items-center gap-2"
                    disabled={uploadingImage}
                  >
                    <Save size={18} />
                    {uploadingImage
                      ? 'Mengupload...'
                      : editingArticle
                      ? 'Update Artikel'
                      : 'Simpan Artikel'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
          style={{ margin: 0, padding: 0 }}
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Hapus Artikel?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Artikel <strong>"{deleteConfirm.judul}"</strong> akan dihapus secara permanen.
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  variant="secondary"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={() => handleDelete(deleteConfirm)}
                  variant="danger"
                  className="flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

