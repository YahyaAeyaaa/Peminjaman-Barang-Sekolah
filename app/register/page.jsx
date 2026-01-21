'use client';

import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ebeff2] px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-[#316e94] mx-auto" />
        <h1 className="text-2xl font-semibold text-gray-900">Registrasi Dinonaktifkan</h1>
        <p className="text-gray-600 text-sm">
          Semua akun siswa/petugas dibuat oleh Admin melalui panel atau import Excel. Silakan hubungi Admin
          untuk dibuatkan akun.
        </p>
        <Link
          href="/Login"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-[#316e94] text-white text-sm font-medium hover:bg-[#255a7a] transition-colors"
        >
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
}

