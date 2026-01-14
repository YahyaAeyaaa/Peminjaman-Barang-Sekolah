'use client';

import Button from '@/components/button';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-6 flex items-center justify-between gap-4 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          radius="full"
          className="px-3 py-1.5"
          disabled={!canPrev}
          onClick={() => canPrev && onPageChange(currentPage - 1)}
        >
          ‹ Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          radius="full"
          className="px-3 py-1.5"
          disabled={!canNext}
          onClick={() => canNext && onPageChange(currentPage + 1)}
        >
          Selanjutnya ›
        </Button>
      </div>

      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`h-8 w-8 rounded-full text-xs font-medium transition ${
              page === currentPage
                ? 'bg-[#161b33] text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}


