'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { loginSchema } from '../validateLogin';

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Cek jika ada pesan dari register
  const isRegistered = searchParams.get('registered') === 'true';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error saat user mengetik
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
    if (errors.submit) {
      setErrors({ ...errors, submit: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validasi menggunakan Zod
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const newErrors = {};
      if (result.error && result.error.issues) {
        result.error.issues.forEach((err) => {
          if (err.path && err.path.length > 0) {
            newErrors[err.path[0]] = err.message;
          }
        });
      }
      setErrors(newErrors);
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
        setErrors({ submit: 'Email atau password salah' });
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
        setErrors({ submit: 'Terjadi kesalahan saat login' });
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'Terjadi kesalahan saat login' });
      setLoading(false);
    }
  };

  return {
    // State
    showPassword,
    setShowPassword,
    loading,
    errors,
    formData,
    isRegistered,
    
    // Handlers
    handleChange,
    handleSubmit,
  };
}

