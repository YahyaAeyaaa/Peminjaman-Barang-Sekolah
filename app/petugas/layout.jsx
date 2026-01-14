import { Josefin_Sans } from 'next/font/google';
import PetugasNavbar from '@/components/navbar/PetugasNavbar';

const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-josefin-sans',
  display: 'swap',
});

export default function PetugasLayout({ children }) {
  return (
    <div className={`${josefinSans.variable} font-josefin min-h-screen bg-[#faf8f5]`}>
      <PetugasNavbar />
      <main className="font-josefin">{children}</main>
    </div>
  );
}

