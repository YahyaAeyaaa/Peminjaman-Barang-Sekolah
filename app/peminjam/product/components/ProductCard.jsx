'use client';

import { useState } from 'react';

export function ProductCard({ product, onOpenDetail }) {
  const [imageError, setImageError] = useState(false);
  
  const stockStatus = product.stock === 0 ? 'habis' : 
                      product.stock <= 2 ? 'terbatas' : 'tersedia';
  
  const stockColor = product.stock === 0 ? 'bg-red-100 text-red-700 border-red-200' : 
                     product.stock <= 2 ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                     'bg-emerald-100 text-emerald-700 border-emerald-200';

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {product.image && !imageError ? (
          <img 
            src={product.image} 
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <p className="text-sm text-gray-500 font-medium">{product.type}</p>
            </div>
          </div>
        )}
        
        {/* Availability Badge */}
        {!product.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <span className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-full">
              Tidak Tersedia
            </span>
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-semibold rounded-full shadow-sm border border-gray-200">
            {product.type}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </div>
          {onOpenDetail && (
            <button
              type="button"
              onClick={onOpenDetail}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Detail
            </button>
          )}
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stock & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${stockColor}`}>
              Stock: {product.stock}
            </div>
            <span className={`text-xs font-medium capitalize ${
              stockStatus === 'habis' ? 'text-red-600' :
              stockStatus === 'terbatas' ? 'text-amber-600' :
              'text-emerald-600'
            }`}>
              {stockStatus}
            </span>
          </div>
          
          <button 
            disabled={!product.available || product.stock === 0}
            onClick={onOpenDetail}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              product.available && product.stock > 0
                ? 'bg-[#161b33] text-white hover:bg-blue-700 active:scale-95 shadow-sm hover:shadow-md'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {product.available && product.stock > 0 ? 'Pinjam' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}