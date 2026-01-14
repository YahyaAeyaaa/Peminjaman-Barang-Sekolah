'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PeminjamNavbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/peminjam', label: 'Beranda' },
    { href: '/peminjam/peminjaman', label: 'Pinjaman' },
    { href: '/peminjam/riwayat', label: 'Riwayat' },
    { href: '/peminjam/product', label: 'Product' },
  ];

  return (
    <nav className="font-josefin w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
            <span className="text-black font-medium text-lg">Pjam Dong</span>
          </div>

          {/* Middle - Navbar Items */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-blue-500 border-b-2 border-blue-500 pb-1'
                      : 'text-gray-600 hover:text-blue-500'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side - Profile Avatar */}
          <div className="flex items-center gap-4">
            <Link
              href="/peminjam/profil"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#161b33] text-xs font-semibold text-white shadow-sm hover:bg-[#111628] transition"
            >
              <span className="select-none">PR</span>
              {/* Nanti bisa diganti inisial user atau foto profil */}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

