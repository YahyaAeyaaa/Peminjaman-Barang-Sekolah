import { PeminjamHero, QuickActionCard } from './components/example';
import { quickActions } from './data/navCard';

export default function PeminjamPage() {

    return (
        <div className="font-josefin min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Hero Section – versi sederhana */}
                <PeminjamHero />

                {/* Quick Actions */}
                <section className="grid gap-6 md:grid-cols-3">
                    {quickActions.map((item) => (
                        <QuickActionCard
                            key={item.title}
                            title={item.title}
                            desc={item.desc}
                            color={item.color}
                            border={item.border}
                        />
                    ))}
                </section>

                {/* Tips Section */}
                <section className="rounded-3xl bg-white p-8 shadow-sm">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.4em] text-gray-400">Tips Menggunakan Sistem</p>
                            <h2 className="mt-2 text-2xl font-semibold text-gray-900">Lebih produktif dengan fitur favorit</h2>
                            <p className="mt-3 text-gray-600">
                                Tandai alat favorit, dan gunakan filter pencarian untuk menemukan alat lebih cepat.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:w-1/2">
                            <div className="rounded-2xl border border-dashed border-gray-200 p-4">
                                <p className="text-sm font-semibold text-gray-800">Filter Pencarian</p>
                                <p className="text-sm text-gray-500">Gunakan Filter Pencarian untuk menemukan alat lebih cepat.</p>
                            </div>
                            <div className="rounded-2xl border border-dashed border-gray-200 p-4">
                                <p className="text-sm font-semibold text-gray-800">Daftar Favorit</p>
                                <p className="text-sm text-gray-500">Simpan alat favorit untuk akses instan.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}