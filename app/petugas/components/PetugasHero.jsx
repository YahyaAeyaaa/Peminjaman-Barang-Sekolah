import Button from '@/components/button';

export function PetugasHero() {
  return (
    <section className="rounded-3xl bg-white px-8 py-10 shadow-sm border border-gray-100">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4 md:max-w-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-400">
            Petugas • Dashboard
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
            Kelola persetujuan dan pengembalian alat dengan efisien.
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Menyetujui peminjaman, memantau pengembalian barang, dan mencetak laporan peminjaman untuk kelancaran operasional.
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
              Menyetujui Peminjaman
            </Button>
            <Button
              variant="outline"
              size="sm"
              radius="full"
              className="border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 px-6 py-2.5"
            >
              Memantau Pengembalian
            </Button>
          </div>
        </div>

        <div className="mt-4 md:mt-0">
          <div className="rounded-2xl border border-dashed border-gray-200 bg-[#faf8f5] px-6 py-5 max-w-xs">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em]">
              Quick Info
            </p>
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <p>• Menyetujui pengajuan peminjaman baru.</p>
              <p>• Memantau status pengembalian barang.</p>
              <p>• Mencetak laporan peminjaman.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

