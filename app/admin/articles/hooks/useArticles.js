import { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import { articlesAPI } from '@/lib/api/articles';
import { uploadAPI } from '@/lib/api/upload';

const initialFormData = {
  judul: '',
  konten: '',
  excerpt: '',
  thumbnail: '',
  tags: [],
  status: 'DRAFT',
};

export function useArticles() {
  const toast = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch articles
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus) params.status = filterStatus;

      const response = await articlesAPI.getAll(params);
      if (response.success) {
        setArticles(response.data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Gagal Memuat Data', 'Terjadi kesalahan saat memuat data artikel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [searchTerm, filterStatus]);

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

  // Handle image change
  const handleImageChange = (file, previewUrl) => {
    setImageFile(file);
    setImagePreview(previewUrl);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setUploadingImage(true);

    // Validasi
    if (!formData.judul.trim()) {
      setFormErrors({ judul: 'Judul artikel wajib diisi' });
      setUploadingImage(false);
      return;
    }

    if (!formData.konten.trim()) {
      setFormErrors({ konten: 'Konten artikel wajib diisi' });
      setUploadingImage(false);
      return;
    }

    if (formData.konten.trim().length < 50) {
      setFormErrors({ konten: 'Konten minimal 50 karakter' });
      setUploadingImage(false);
      return;
    }

    try {
      // Upload image jika ada file baru
      let thumbnailUrl = formData.thumbnail;
      if (imageFile) {
        try {
          thumbnailUrl = await uploadImage(imageFile);
        } catch (error) {
          toast.error('Gagal Upload Gambar', error.message || 'Terjadi kesalahan saat mengupload gambar');
          setUploadingImage(false);
          return;
        }
      }

      // Prepare payload
      const payload = {
        ...formData,
        thumbnail: thumbnailUrl || null,
      };

      const response = editingArticle
        ? await articlesAPI.update(editingArticle.id, payload)
        : await articlesAPI.create(payload);

      if (response.success) {
        toast.success(
          editingArticle ? 'Artikel Berhasil Diupdate' : 'Artikel Berhasil Dibuat',
          editingArticle
            ? 'Data artikel telah diperbarui'
            : 'Artikel baru telah ditambahkan'
        );
        setIsFormOpen(false);
        setEditingArticle(null);
        setFormData(initialFormData);
        setTagInput('');
        setImageFile(null);
        setImagePreview(null);
        fetchArticles();
      } else {
        setFormErrors({ general: response.error || 'Terjadi kesalahan' });
        toast.error('Gagal Menyimpan', response.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Gagal Menyimpan', error.message || 'Terjadi kesalahan saat menyimpan artikel');
      setFormErrors({ general: error.message || 'Gagal menyimpan artikel' });
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle edit
  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      judul: article.judul,
      konten: article.konten,
      excerpt: article.excerpt || '',
      thumbnail: article.thumbnail || '',
      tags: article.tags || [],
      status: article.status,
    });
    setTagInput('');
    setImageFile(null);
    setImagePreview(article.thumbnail || null);
    setIsFormOpen(true);
  };

  // Handle delete
  const handleDelete = async (article) => {
    try {
      const response = await articlesAPI.delete(article.id);

      if (response.success) {
        toast.success('Artikel Berhasil Dihapus', 'Data artikel telah dihapus dari sistem');
        setDeleteConfirm(null);
        fetchArticles();
      } else {
        toast.error('Gagal Menghapus', response.error || 'Terjadi kesalahan saat menghapus artikel');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Gagal Menghapus', error.message || 'Terjadi kesalahan saat menghapus artikel');
    }
  };

  // Handle add tag
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  // Handle remove tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Handle tag input key press
  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setEditingArticle(null);
    setTagInput('');
    setImageFile(null);
    setImagePreview(null);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-yellow-100 text-yellow-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      DRAFT: 'Draft',
      PUBLISHED: 'Published',
      ARCHIVED: 'Archived',
    };
    return labels[status] || status;
  };

  return {
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
  };
}

