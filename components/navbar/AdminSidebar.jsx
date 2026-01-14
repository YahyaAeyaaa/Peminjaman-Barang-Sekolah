'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FolderTree, 
  FileText, 
  ClipboardList,
  RotateCcw,
  Activity,
  KeyRound,
  LogOut
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { 
      href: '/admin', 
      label: 'Dashboard', 
      icon: <LayoutDashboard size={20} />,
      exact: true
    },
    { 
      href: '/admin/users', 
      label: 'Manajemen User', 
      icon: <Users size={20} />
    },
    { 
      href: '/admin/equipment', 
      label: 'Manajemen Alat', 
      icon: <Package size={20} />
    },
    { 
      href: '/admin/categories', 
      label: 'Manajemen Kategori', 
      icon: <FolderTree size={20} />
    },
    { 
      href: '/admin/loans', 
      label: 'Data Peminjaman', 
      icon: <ClipboardList size={20} />
    },
    { 
      href: '/admin/returns', 
      label: 'Data Pengembalian', 
      icon: <RotateCcw size={20} />
    },
    { 
      href: '/admin/articles', 
      label: 'Artikel', 
      icon: <FileText size={20} />
    },
    { 
      href: '/admin/registration-codes', 
      label: 'Kode Registrasi', 
      icon: <KeyRound size={20} />
    },
    { 
      href: '/admin/activity-logs', 
      label: 'Log Aktifitas', 
      icon: <Activity size={20} />
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-sm z-40">
      {/* Logo/Brand */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-[#105273]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-indigo-600 font-bold text-lg">A</span>
          </div>
          <span className="text-white font-semibold text-lg">Admin Panel</span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {menuItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname?.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-semibold border border-indigo-200 shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span className={isActive ? 'text-indigo-600' : 'text-gray-500'}>
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <button
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

