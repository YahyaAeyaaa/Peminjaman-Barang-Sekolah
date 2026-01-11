'use client';

import { Home } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex justify-center items-center py-4">
      <div 
        className="flex items-center justify-center gap-[200px] px-8 py-3 rounded-full"
        style={{ 
          backgroundColor: '#e8e8e3',
          color: '#4f5e61'
        }}
      >
        <Link href="/" className="">
          <Home size={20} strokeWidth={1.5} />
        </Link>
        <Link href="/work" className=" transition text-[14px]">
          WORK
        </Link>
        <Link href="/about" className=" transition text-[14px]">
          ABOUT
        </Link>
        <Link href="/blog" className=" transition text-[14px]">
          BLOG
        </Link>
        <Link href="/contact" className=" transition text-[14px]">
          CONTACT
        </Link>
      </div>
    </nav>
  );
}
