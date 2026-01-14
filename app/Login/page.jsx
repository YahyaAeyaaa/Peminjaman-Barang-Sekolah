'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Input from '@/components/forminput';
import Button from '@/components/button';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Cek jika ada pesan dari register
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      // Bisa tampilkan notifikasi sukses register
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error saat user mengetik
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validasi
    if (!formData.email || !formData.password) {
      setError('Email dan password wajib diisi');
      setLoading(false);
      return;
    }

    try {
      // Login dengan NextAuth
      const result = await signIn('credentials', {
        email: formData.email.trim(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email atau password salah');
        setLoading(false);
        return;
      }

      if (result?.ok) {
        // Login berhasil, tunggu sebentar untuk session ter-update
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Fetch session untuk mendapatkan role
        try {
          const sessionResponse = await fetch('/api/auth/session');
          const session = await sessionResponse.json();
          const role = session?.user?.role;
          
          const callbackUrl = searchParams.get('callbackUrl');
          
          if (callbackUrl) {
            // Jika ada callbackUrl, gunakan itu (middleware akan handle role check)
            router.push(callbackUrl);
          } else {
            // Redirect berdasarkan role
            if (role === 'ADMIN') {
              router.push('/admin');
            } else if (role === 'PETUGAS') {
              router.push('/petugas');
            } else if (role === 'PEMINJAM') {
              router.push('/peminjam');
            } else {
              router.push('/admin'); // Default fallback
            }
          }
        } catch (err) {
          // Jika error fetch session, redirect ke default
          const callbackUrl = searchParams.get('callbackUrl') || '/admin';
          router.push(callbackUrl);
        }
        
        router.refresh(); // Refresh untuk update session
      } else {
        // Jika result tidak ok dan tidak ada error, mungkin ada masalah
        setError('Terjadi kesalahan saat login');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Terjadi kesalahan saat login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#ebeff2]">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col bg-[#faf8f5] px-12 py-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#115778] rounded-full"></div>
            <span className="text-black font-medium">Terserah Deh.</span>
          </div>
          <div className="flex items-center gap-6 text-gray-400">
            <a href="#" className="hover:text-gray-600">Profile Dev</a>
          </div>
        </nav>

        {/* Form Content */}
        <div className="flex-1 flex flex-col justify-center max-w-xl mx-40">
          <h1 className="text-4xl font-bold text-black mb-2">
            Login.
            <span className="inline-block w-2 h-2 bg-[#de913e] rounded-full ml-2"></span>
          </h1>
          
          <p className="text-gray-400 mb-8">
            Not A Member?{' '}
            <Link href="/" className="text-blue-500 hover:underline">Sign Up</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message dari Register */}
            {searchParams.get('registered') === 'true' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">Registrasi berhasil! Silakan login.</p>
              </div>
            )}

            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail size={18} />}
              radius="full"
              focusColor="#105273"
              required
              disabled={loading}
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              leftIcon={<Lock size={18} />}
              radius="full"
              required
              disabled={loading}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                radius='full'
                type="button"
                onClick={() => router.push('/register')}
                disabled={loading}
              >
                Daftar
              </Button>
              <Button
                variant="primary"
                bgColor="#de913e"
                hoverColor="#125475"
                type="submit"
                radius='full'
                loading={loading}
                disabled={loading}
              >
                Login
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image with Wavy Overlay */}
      <div className="flex-1 relative hidden lg:block min-h-screen overflow-hidden">
        {/* Background Image */}
        <img
          src="/image/gurun.jpg"
          alt="Scenic background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Wavy white overlay - SMOOTH CURVE */}
        <div 
          className="absolute left-0 top-0 w-4/5 h-full bg-gradient-to-r from-[#faf8f5] via-white/95 to-transparent"
          style={{
            clipPath: `path('M 0 0 C 120 100, 80 200, 150 300 C 200 380, 60 460, 130 550 C 180 620, 70 700, 120 800 L 0 800 Z')`
          }}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#ebeff2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#de913e] mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

