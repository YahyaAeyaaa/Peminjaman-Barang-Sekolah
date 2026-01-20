'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function PeminjamNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userInitials, userName, userEmail, userAvatar } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const displayInitials = userInitials || 'PR';
  const displayName = userName || 'Peminjam';
  const displayEmail = userEmail;

  const navItems = [
    { href: '/peminjam', label: 'Beranda' },
    { href: '/peminjam/peminjaman', label: 'Pinjaman' },
    { href: '/peminjam/riwayat', label: 'Riwayat' },
    { href: '/peminjam/product', label: 'Product' },
    { href: '/peminjam/articles', label: 'Pengumuman' },
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

          {/* Right Side - Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={displayName}
                  className="h-9 w-9 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#161b33] text-white text-xs font-semibold">
                  {displayInitials}
                </div>
              )}
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">{displayName}</div>
                <div className="text-xs text-gray-500">{displayEmail}</div>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${
                  showProfileMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                ></div>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">{displayName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{displayEmail}</div>
                  </div>

                  <Link
                    href="/peminjam/profil"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User size={18} className="text-gray-400" />
                    Profile
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

