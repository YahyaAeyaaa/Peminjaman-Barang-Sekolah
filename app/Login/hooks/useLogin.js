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
      const signInPromise = signIn('credentials', {
        email: formData.email.trim(),
        password: formData.password,
        redirect: false,
      });

      const timeoutMs = 45000;
      const result = await Promise.race([
        signInPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeoutMs)
        ),
      ]);

      if (result?.error) {
        setErrors({ submit: 'Email atau password salah' });
        setLoading(false);
        return;
      }

      if (result?.ok) {
        const callbackUrl = searchParams.get('callbackUrl');

        let role;
        try {
          const sessionResponse = await fetch('/api/auth/session', {
            cache: 'no-store',
          });
          const session = await sessionResponse.json();
          role = session?.user?.role;
        } catch {
          role = undefined;
        }

        const destination =
          callbackUrl ||
          (role === 'ADMIN'
            ? '/admin'
            : role === 'PETUGAS'
              ? '/petugas'
              : role === 'PEMINJAM'
                ? '/peminjam'
                : '/admin');

        router.push(destination);
        router.refresh();
        return;
      }

      setErrors({ submit: 'Terjadi kesalahan saat login' });
      setLoading(false);
    } catch (error) {
      console.error('Login error:', error);
      const message =
        error?.message === 'timeout'
          ? 'Server lambat (cold start). Tunggu ~1 menit lalu coba lagi.'
          : 'Terjadi kesalahan saat login';
      setErrors({ submit: message });
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

