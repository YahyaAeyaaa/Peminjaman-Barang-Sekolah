'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerSchema } from '../../validateRegis';
import { authAPI } from '@/lib/api/auth';

export function useRegister() {
  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [errors, setErrors] = useState({});
  const [codeError, setCodeError] = useState('');

  const [registrationCode, setRegistrationCode] = useState('');
  const [registerForm, setRegisterForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    kelas: '',
    no_hp: '',
    alamat: '',
  });

  // Handle verify code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!registrationCode.trim()) {
      setCodeError('Kode registrasi wajib diisi');
      return;
    }

    setVerifyingCode(true);
    setCodeError('');

    try {
      const result = await authAPI.verifyCode(registrationCode);
      
      if (result.success) {
        setCodeVerified(true);
        setCodeError('');
      } else {
        setCodeError(result.error || 'Kode registrasi tidak valid');
        setCodeVerified(false);
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setCodeError(error.message || 'Gagal memverifikasi kode');
      setCodeVerified(false);
    } finally {
      setVerifyingCode(false);
    }
  };

  // Handle register
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validasi menggunakan Zod
    const result = registerSchema.safeParse(registerForm);

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

    // Pastikan kode sudah terverifikasi
    if (!codeVerified) {
      setErrors({ submit: 'Silakan verifikasi kode registrasi terlebih dahulu' });
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register({
        code: registrationCode,
        ...registerForm,
      });

      if (response.success) {
        // Redirect ke login dengan success message
        router.push('/Login?registered=true');
      } else {
        setErrors({ submit: response.error || 'Gagal melakukan registrasi' });
      }
    } catch (error) {
      console.error('Error registering:', error);
      setErrors({ submit: error.message || 'Gagal melakukan registrasi' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    });
    // Clear error untuk field ini jika ada
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleCodeChange = (value) => {
    setRegistrationCode(value.toUpperCase());
    setCodeError('');
  };

  const resetCode = () => {
    setCodeVerified(false);
    setRegistrationCode('');
    setCodeError('');
  };

  return {
    // State
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    verifyingCode,
    codeVerified,
    errors,
    codeError,
    registrationCode,
    registerForm,
    
    // Handlers
    handleVerifyCode,
    handleRegister,
    handleRegisterChange,
    handleCodeChange,
    resetCode,
  };
}

