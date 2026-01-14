import { Josefin_Sans } from 'next/font/google';
import PeminjamNavbar from '@/components/navbar/PeminjamNavbar';

const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-josefin-sans',
  display: 'swap',
});

export default function PeminjamLayout({ children }) {
  return (
    <div className={`${josefinSans.variable} font-josefin min-h-screen bg-[#faf8f5]`}>
      <PeminjamNavbar />
      <main className="font-josefin p-8">{children}</main>
    </div>
  );
}

