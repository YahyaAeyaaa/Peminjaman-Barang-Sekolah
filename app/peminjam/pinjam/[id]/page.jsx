'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Input from '@/components/forminput';
import Button from '@/components/button';
import { equipmentAPI } from '@/lib/api/equipment';
import { loansAPI } from '@/lib/api/loans';
import { useToast } from '@/components/ToastProvider';
import { Calendar, Package } from 'lucide-react';

export default function PinjamPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const productId = params.id;
  
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  
  const [formData, setFormData] = useState({
    tanggalPinjam: '',
    estimasiKembali: '',
    jumlah: 1,
    alasan: '',
  });
  
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
          setFormData(prev => ({ ...prev, tanggalPinjam: today }));
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
    setFormData(prev => ({
      ...prev,
      [name]: name === 'jumlah' ? parseInt(value) || 1 : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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
    } else if (formData.jumlah > product.stock) {
      newErrors.jumlah = `Jumlah tidak boleh melebihi stok tersedia (${product.stock})`;
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

  if (loadingProduct) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Memuat data produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gray-400 font-semibold mb-2">
            Peminjam • Ajukan Peminjaman
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            Form Pengajuan Peminjaman
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Lengkapi form di bawah untuk mengajukan peminjaman barang
          </p>
        </div>

        {/* Product Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            {product.image && (
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
                {product.type}
              </p>
              <h2 className="text-xl font-semibold text-gray-900 mt-1">
                {product.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {product.description}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span>
                  Stok tersedia: <span className="font-semibold text-gray-700">{product.stock} unit</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          {/* Tanggal Peminjaman */}
          <Input
            label="Tanggal Peminjaman"
            type="date"
            name="tanggalPinjam"
            value={formData.tanggalPinjam}
            onChange={handleChange}
            disabled={true}
            required
            leftIcon={<Calendar size={18} />}
            helperText="Tanggal peminjaman otomatis diisi dengan hari ini"
            className="bg-gray-50"
          />

          {/* Estimasi Pengembalian */}
          <Input
            label="Estimasi Tanggal Pengembalian"
            type="date"
            name="estimasiKembali"
            value={formData.estimasiKembali}
            onChange={handleChange}
            required
            error={errors.estimasiKembali}
            leftIcon={<Calendar size={18} />}
            min={formData.tanggalPinjam}
            helperText="Pilih tanggal estimasi pengembalian barang"
          />

          {/* Jumlah */}
          <Input
            label="Jumlah Barang"
            type="number"
            name="jumlah"
            value={formData.jumlah}
            onChange={handleChange}
            required
            error={errors.jumlah}
            leftIcon={<Package size={18} />}
            min={1}
            max={product.stock}
            helperText={`Maksimal ${product.stock} unit sesuai stok tersedia`}
          />

          {/* Alasan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Alasan / Deskripsi Peminjaman <span className="text-red-500">*</span>
            </label>
            <textarea
              name="alasan"
              value={formData.alasan}
              onChange={handleChange}
              rows={4}
              placeholder="Jelaskan alasan dan tujuan peminjaman barang ini..."
              className={`w-full px-4 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.alasan
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-[#161b33] focus:ring-[#161b33]'
              }`}
              required
            />
            {errors.alasan && (
              <p className="mt-1.5 text-sm text-red-600">{errors.alasan}</p>
            )}
            {!errors.alasan && (
              <p className="mt-1.5 text-sm text-gray-500">
                Minimal 10 karakter. Jelaskan secara detail tujuan peminjaman.
              </p>
            )}
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-6"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              bgColor="#161b33"
              hoverColor="#111628"
              loading={loading}
              className="px-6"
            >
              Ajukan Peminjaman
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

