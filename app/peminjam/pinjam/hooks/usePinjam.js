import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { equipmentAPI } from '@/lib/api/equipment';
import { loansAPI } from '@/lib/api/loans';

const initialFormData = {
  tanggalPinjam: '',
  estimasiKembali: '',
  jumlah: 1,
  alasan: '',
};

export function usePinjam(productId) {
  const router = useRouter();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch product dari API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        const response = await equipmentAPI.getById(productId);

        if (response.success) {
          const equipment = response.data;
          // Transform equipment ke format product
          const transformedProduct = {
            id: equipment.id,
            name: equipment.nama,
            type: equipment.kategori?.nama || 'Lainnya',
            description: equipment.deskripsi || 'Tidak ada deskripsi',
            image: equipment.gambar || null,
            stock: equipment.stok || 0,
            available: equipment.status === 'AVAILABLE' && equipment.stok > 0,
            tags: equipment.tags || [],
            kode_alat: equipment.kode_alat,
            kategori_id: equipment.kategori_id,
          };

          setProduct(transformedProduct);

          // Set tanggal peminjaman ke hari ini (read-only)
          const today = new Date().toISOString().split('T')[0];
          setFormData((prev) => ({ ...prev, tanggalPinjam: today }));
        } else {
          toast.error(response.error || 'Produk tidak ditemukan');
          router.push('/peminjam/product');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Gagal memuat data produk');
        router.push('/peminjam/product');
      } finally {
        setLoadingProduct(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, router, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'jumlah' ? parseInt(value) || 1 : value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.estimasiKembali) {
      newErrors.estimasiKembali = 'Estimasi tanggal pengembalian wajib diisi';
    } else {
      const estimasi = new Date(formData.estimasiKembali);
      const pinjam = new Date(formData.tanggalPinjam);
      if (estimasi <= pinjam) {
        newErrors.estimasiKembali = 'Estimasi pengembalian harus setelah tanggal peminjaman';
      }
    }

    if (!formData.jumlah || formData.jumlah < 1) {
      newErrors.jumlah = 'Jumlah minimal 1';
    } else if (formData.jumlah > product?.stock) {
      newErrors.jumlah = `Jumlah tidak boleh melebihi stok tersedia (${product?.stock})`;
    }

    if (!formData.alasan || formData.alasan.trim().length < 10) {
      newErrors.alasan = 'Alasan peminjaman minimal 10 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Convert tanggal deadline ke ISO string
      const tanggalDeadline = new Date(formData.estimasiKembali);
      tanggalDeadline.setHours(23, 59, 59, 999); // Set ke akhir hari

      // Submit ke API
      const response = await loansAPI.create({
        equipment_id: product.id,
        jumlah: formData.jumlah,
        tanggal_deadline: tanggalDeadline.toISOString(),
        keterangan: formData.alasan.trim(),
      });

      if (response.success) {
        toast.success('Peminjaman berhasil diajukan, menunggu persetujuan petugas');
        // Redirect ke halaman peminjaman
        router.push('/peminjam/peminjaman');
      } else {
        setErrors({ submit: response.error || 'Gagal mengajukan peminjaman' });
        toast.error(response.error || 'Gagal mengajukan peminjaman');
      }
    } catch (error) {
      console.error('Error submitting loan:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Gagal mengajukan peminjaman';
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    product,
    loadingProduct,
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
  };
}


