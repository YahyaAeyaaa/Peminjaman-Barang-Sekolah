import Button from '@/components/button';

export function PeminjamHero() {
  return (
    <section className="rounded-3xl bg-white px-8 py-10 shadow-sm border border-gray-100">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4 md:max-w-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-400">
            Peminjam • Dashboard
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
            Kelola peminjaman alat dengan tenang dan teratur.
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Mulai peminjaman baru, cek status pengembalian, dan lihat riwayat alat yang pernah kamu gunakan.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="primary"
              size="sm"
              radius="full"
              bgColor="#161b33"
              hoverColor="#111628"
              className="px-6 py-2.5 text-sm shadow-sm"
            >
              Mulai peminjaman
            </Button>
            <Button
              variant="outline"
              size="sm"
              radius="full"
              className="border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 px-6 py-2.5"
            >
              Lihat riwayat
            </Button>
          </div>
        </div>

        <div className="mt-4 md:mt-0">
          <div className="rounded-2xl border border-dashed border-gray-200 bg-[#faf8f5] px-6 py-5 max-w-xs">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em]">
              Ringkasan singkat
            </p>
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <p>• Lihat peminjaman yang masih aktif.</p>
              <p>• Cek batas waktu pengembalian alat.</p>
              <p>• Pantau riwayat pemakaian untuk referensi.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function QuickActionCard({ title, desc, color, border }) {
  return (
    <div
      className={`rounded-2xl border ${border} bg-gradient-to-br ${color} p-6 shadow-sm`}
    >
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-gray-600">{desc}</p>
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 px-0 text-sm font-semibold text-blue-600 hover:underline"
      >
        Lihat detail →
      </Button>
    </div>
  );
}

export function ProductCard({ product }) {
  const initials = product.name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm transition hover:shadow-md hover:-translate-y-[1px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-12 w-12 rounded-xl object-cover bg-gray-100"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#161b33] text-xs font-semibold text-white">
              {initials}
            </div>
          )}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
              {product.type}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-gray-900">
              {product.name}
            </h3>
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
            product.available
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-amber-50 text-amber-700 border border-amber-100'
          }`}
        >
          {product.available ? 'Tersedia' : 'Sedang dipinjam'}
        </span>
      </div>

      <p className="mt-3 text-sm text-gray-600">
        {product.description}
      </p>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <p>
          Stok:{' '}
          <span className="font-semibold text-gray-800">
            {product.stock} unit
          </span>
        </p>
        <div className="flex flex-wrap gap-1">
          {product.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Button
          variant="primary"
          size="sm"
          radius="full"
          bgColor="#161b33"
          hoverColor="#111628"
          className="w-full text-sm"
        >
          Ajukan peminjaman
        </Button>
      </div>
    </div>
  );
}

