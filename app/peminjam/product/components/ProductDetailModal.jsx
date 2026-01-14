'use client';

import { useRouter } from 'next/navigation';

export default function ProductDetailModal({ product, open, onClose }) {
  const router = useRouter();
  
  if (!open || !product) return null;

  const handleAjukanPeminjaman = () => {
    onClose();
    router.push(`/peminjam/pinjam/${product.id}`);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-semibold">
              Detail Produk
            </p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900">
              {product.name}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{product.type}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Image */}
          {product.image && (
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-100 max-h-56">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-56 object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Deskripsi</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Tags & Specs */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Spesifikasi singkat</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stock info */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-sm">
            <p className="text-gray-600">
              Stok tersedia:{' '}
              <span className="font-semibold text-gray-900">{product.stock} unit</span>
            </p>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                product.available
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-100'
              }`}
            >
              {product.available ? 'Bisa dipinjam' : 'Sedang dipinjam'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-3 bg-gray-50/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Tutup
          </button>
          <button
            type="button"
            disabled={!product.available || product.stock === 0}
            onClick={handleAjukanPeminjaman}
            className={`px-5 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all ${
              product.available && product.stock > 0
                ? 'bg-[#161b33] text-white hover:bg-blue-700 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {product.available && product.stock > 0 ? 'Ajukan peminjaman' : 'Tidak tersedia'}
          </button>
        </div>
      </div>
    </div>
  );
}