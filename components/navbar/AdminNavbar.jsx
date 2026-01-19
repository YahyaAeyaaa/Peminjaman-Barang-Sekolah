'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AdminNavbar() {
  const router = useRouter();
  const { userInitials, userName, userEmail } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const displayInitials = userInitials || 'A';
  const displayName = userName || 'Admin';
  const displayEmail = userEmail || 'admin@example.com';

  return (
    <nav className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Side - Empty (sidebar handles navigation) */}
        <div className="flex-1"></div>

        {/* Right Side - Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#161b33] text-white text-sm font-semibold">
              {displayInitials}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-900">{displayName}</div>
              <div className="text-xs text-gray-500">{displayEmail}</div>
            </div>
            <ChevronDown
              size={18}
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
                  href="/admin/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={18} className="text-gray-400" />
                  Profile
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={18} className="text-gray-400" />
                  Settings
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
    </nav>
  );
}



