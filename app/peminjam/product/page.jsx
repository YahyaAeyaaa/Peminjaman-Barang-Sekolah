'use client';

import { useState, useMemo } from 'react';
import { products } from '../data/products';
import { ProductCard } from './components/ProductCard';
import Pagination from '../../../components/Pagination';
import ProductDetailModal from './components/ProductDetailModal';

export default function ProductPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const pageSize = 6;

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));

  const visibleProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

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

        {/* Info jumlah produk */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-xs md:text-sm text-gray-500">
          <span>
            Menampilkan{' '}
            <span className="font-semibold text-gray-700">
              {startIndex}-{endIndex}
            </span>{' '}
            dari{' '}
            <span className="font-semibold text-gray-700">
              {products.length}
            </span>{' '}
            produk
          </span>
        </div>

        {/* Grid produk */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={() => handleOpenDetail(product)}
            />
          ))}
        </section>

        <div className="pt-2 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={handleCloseDetail}
      />
    </div>
  );
}