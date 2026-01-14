'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from './components/ProductCard';
import Pagination from '../../../components/Pagination';
import ProductDetailModal from './components/ProductDetailModal';
import SearchComponent from '@/components/search';
import FilterSelect from '@/components/filterSelect';
import { useProducts } from './hooks/useProducts';
import { categoriesAPI } from '@/lib/api/categories';

export default function ProductPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const pageSize = 6;

  // Build filters object
  const filters = useMemo(() => {
    const filterObj = {};
    if (searchTerm.trim()) filterObj.search = searchTerm.trim();
    if (filterKategori) filterObj.kategori_id = filterKategori;
    return filterObj;
  }, [searchTerm, filterKategori]);

  const { products, loading, error } = useProducts(filters);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        if (response.success) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterKategori]);

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));

  const visibleProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [currentPage, pageSize, products]);

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, products.length);

  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="space-y-3 text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500 font-semibold">
            Peminjam • Produk
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Pilih barang elektronik yang ingin kamu pinjam.
          </h1>
          <p className="text-base text-gray-600 max-w-3xl mx-auto md:mx-0">
            Motherboard, VGA, prosesor, RAM, PC rakitan, casing, monitor, sampai keyboard — 
            semuanya tersedia untuk kebutuhan praktikum dan eksplorasi kamu.
          </p>
        </header>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchComponent
              value={searchTerm}
              onChange={(val) => setSearchTerm(val)}
              placeholder="Cari produk..."
              size="medium"
            />
          </div>
          <div className="w-full sm:w-64">
            <FilterSelect
              label=""
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              options={[
                { value: '', label: 'Semua Kategori' },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: cat.nama,
                })),
              ]}
              placeholder="Filter Kategori"
              size="medium"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
              <p className="text-gray-600">Memuat produk...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {/* Info jumlah produk */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-xs md:text-sm text-gray-500">
              <span>
                Menampilkan{' '}
                <span className="font-semibold text-gray-700">
                  {products.length > 0 ? `${startIndex}-${endIndex}` : '0'}
                </span>{' '}
                dari{' '}
                <span className="font-semibold text-gray-700">
                  {products.length}
                </span>{' '}
                produk
              </span>
            </div>

            {/* Grid produk */}
            {products.length > 0 ? (
              <>
                <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenDetail={() => handleOpenDetail(product)}
                    />
                  ))}
                </section>

                {totalPages > 1 && (
                  <div className="pt-2 border-t border-gray-200">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada produk ditemukan</h3>
                <p className="text-gray-600">
                  {searchTerm || filterKategori
                    ? 'Coba ubah kata kunci atau filter yang digunakan'
                    : 'Belum ada produk yang tersedia'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={handleCloseDetail}
      />
    </div>
  );
}