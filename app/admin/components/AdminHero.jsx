import Button from '@/components/button';

export function AdminHero() {
  return (
    <section className="rounded-3xl bg-white px-8 py-10 shadow-lg border ">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4 md:max-w-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-400">
            Admin • Dashboard
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
            Kelola seluruh sistem peminjaman alat dengan kontrol penuh.
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Manajemen user, alat, kategori, peminjaman, pengembalian, dan aktivitas sistem dalam satu dashboard terpusat.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="primary"
              size="sm"
              radius="full"
              bgColor="#161b33"
              hoverColor="#000000"
              textColor="#fff"
              className="px-6 py-2.5 text-sm shadow-lg font-semibold"
            >
              Kelola User
            </Button>
            <Button
              variant="outline"
              size="sm"
              radius="full"
              className="border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 px-6 py-2.5"
            >
              Kelola Alat
            </Button>
          </div>
        </div>

        <div className="mt-4 md:mt-0">
          <div className="rounded-2xl border border-white/20 bg-[#faf8f5] backdrop-blur-sm px-6 py-5 max-w-xs">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em]">
              Quick Info
            </p>
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <p>• Kelola semua pengguna sistem</p>
              <p>• Manajemen alat dan kategori</p>
              <p>• Monitor peminjaman & pengembalian</p>
              <p>• Lihat log aktivitas sistem</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

