import { useState, useEffect, useCallback } from 'react';
import { equipmentAPI } from '@/lib/api/equipment';

/**
 * Custom hook untuk fetching products (equipment) yang bisa dipinjam
 * Hanya menampilkan equipment dengan status AVAILABLE dan stok > 0
 * 
 * @param {Object} filters - Filter options
 * @param {string} filters.search - Search term
 * @param {string} filters.kategori_id - Filter by category ID
 */
export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = {
        status: 'AVAILABLE',
        ...filters,
      };

      // Fetch equipment dengan status AVAILABLE dan filters
      const response = await equipmentAPI.getAll(params);

      if (response.success) {
        // Transform data equipment ke format product
        const transformedProducts = response.data
          .map((equipment) => {
            // Handle image path - equipment.gambar bisa berupa:
            // 1. Full path: "/uploads/filename.jpg" -> langsung pakai
            // 2. Filename only: "filename.jpg" -> tambahkan /uploads/
            // 3. null/undefined -> null
            let imagePath = null;
            if (equipment.gambar) {
              if (equipment.gambar.startsWith('/')) {
                // Sudah full path
                imagePath = equipment.gambar;
              } else {
                // Hanya filename, tambahkan /uploads/
                imagePath = `/uploads/${equipment.gambar}`;
              }
            }

            return {
              id: equipment.id,
              name: equipment.nama,
              type: equipment.kategori?.nama || 'Lainnya',
              description: equipment.deskripsi || 'Tidak ada deskripsi',
              image: imagePath,
              stock: equipment.stok || 0,
              available: equipment.status === 'AVAILABLE' && equipment.stok > 0,
              tags: equipment.tags || [],
              kode_alat: equipment.kode_alat,
              kategori_id: equipment.kategori_id,
              kategori: equipment.kategori,
            };
          })
          // Filter hanya yang stok > 0
          .filter((product) => product.stock > 0);

        setProducts(transformedProducts);
      } else {
        setError(response.error || 'Gagal memuat data produk');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Terjadi kesalahan saat memuat data produk');
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.kategori_id]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
}


