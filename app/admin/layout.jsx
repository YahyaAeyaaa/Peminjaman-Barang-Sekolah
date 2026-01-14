import { Josefin_Sans } from 'next/font/google';
import AdminSidebar from '@/components/navbar/AdminSidebar';

const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-josefin-sans',
  display: 'swap',
});

export default function AdminLayout({ children }) {
  return (
    <div className={`${josefinSans.variable} font-josefin min-h-screen bg-[#faf8f5]`}>
      <AdminSidebar />
      <main className="ml-64 font-josefin">
        {children}
      </main>
    </div>
  );
}

