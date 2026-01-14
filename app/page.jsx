'use client';

import { useState } from 'react';
import Input from '@/components/forminput';
import Button from '@/components/button';
import { Mail, Lock, Eye, EyeOff, User, KeyRound, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { registerSchema } from './validateRegis';

export default function RegisterPage() {
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
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: registrationCode.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setCodeVerified(true);
        setCodeError('');
      } else {
        setCodeError(data.error || 'Kode registrasi tidak valid');
        setCodeVerified(false);
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setCodeError('Gagal memverifikasi kode');
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
      result.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          newErrors[err.path[0]] = err.message;
        }
      });
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: registrationCode.trim(),
          ...registerForm,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Registrasi berhasil! Silakan login.');
        window.location.href = '/Login?registered=true';
      } else {
        setErrors({ submit: data.error || 'Gagal melakukan registrasi' });
      }
    } catch (error) {
      console.error('Error registering:', error);
      setErrors({ submit: 'Gagal melakukan registrasi' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  return (
    <div className="min-h-screen flex bg-[#ebeff2]">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col bg-[#faf8f5] px-12 py-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#316e94] rounded-full"></div>
            <span className="text-black font-medium">Terserah Deh.</span>
          </div>
          <div className="flex items-center gap-6 text-gray-400">
            <a href="#" className="hover:text-gray-600">Profile Dev</a>
          </div>
        </nav>

        {/* Form Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-black mb-2">
            Register.
            <span className="inline-block w-2 h-2 bg-[#de913e] rounded-full ml-2"></span>
          </h1>
          
          <p className="text-gray-400 mb-8">
            Already A Member?{' '}
            <Link href="/Login" className="text-blue-500 hover:underline">Sign In</Link>
          </p>

          {/* Form Kode Registrasi */}
          {!codeVerified && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Registrasi <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      name="registrationCode"
                      placeholder="Masukkan kode registrasi"
                      value={registrationCode}
                      onChange={(e) => {
                        setRegistrationCode(e.target.value);
                        setCodeError('');
                      }}
                      leftIcon={<KeyRound size={18} />}
                      radius="full"
                      required
                      error={codeError}
                      focusColor="#316e94"
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      bgColor="#316e94"
                      hoverColor="#255a7a"
                      radius="full"
                      loading={verifyingCode}
                      className="px-6"
                    >
                      Verifikasi
                    </Button>
                  </div>
                  {codeError && (
                    <p className="mt-1 text-sm text-red-600">{codeError}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Masukkan kode registrasi yang diberikan oleh admin
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Status Kode Terverifikasi */}
          {codeVerified && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-sm text-green-700">Kode registrasi terverifikasi</span>
              <button
                type="button"
                onClick={() => {
                  setCodeVerified(false);
                  setRegistrationCode('');
                }}
                className="ml-auto text-xs text-green-600 hover:text-green-800 underline"
              >
                Ubah kode
              </button>
            </div>
          )}

          {/* Form Registrasi */}
          <form onSubmit={handleRegister} className="space-y-4" style={{ display: codeVerified ? 'block' : 'none' }}>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nama Depan"
                  type="text"
                  name="first_name"
                  placeholder="John"
                  value={registerForm.first_name}
                  onChange={handleRegisterChange}
                  leftIcon={<User size={18} />}
                  radius="full"
                  required
                  error={errors.first_name}
                  focusColor="#316e94"
                />
                <Input
                  label="Nama Belakang"
                  type="text"
                  name="last_name"
                  placeholder="Doe"
                  value={registerForm.last_name}
                  onChange={handleRegisterChange}
                  leftIcon={<User size={18} />}
                  radius="full"
                  required
                  error={errors.last_name}
                  focusColor="#316e94"
                />
              </div>

              {/* Email */}
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="nama@email.com"
                value={registerForm.email}
                onChange={handleRegisterChange}
                leftIcon={<Mail size={18} />}
                radius="full"
                required
                error={errors.email}
                focusColor="#316e94"
              />

              {/* Password */}
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Minimal 6 karakter"
                value={registerForm.password}
                onChange={handleRegisterChange}
                leftIcon={<Lock size={18} />}
                radius="full"
                required
                error={errors.password}
                helperText="Minimal 6 karakter"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                focusColor="#316e94"
              />

              {/* Confirm Password */}
              <Input
                label="Konfirmasi Password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirm_password"
                placeholder="Ulangi password"
                value={registerForm.confirm_password}
                onChange={handleRegisterChange}
                leftIcon={<Lock size={18} />}
                radius="full"
                required
                error={errors.confirm_password}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                focusColor="#316e94"
              />

              {/* Optional Fields */}
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">Informasi Tambahan (Opsional)</p>
                
                <Input
                  label="Kelas"
                  type="text"
                  name="kelas"
                  placeholder="Contoh: X-1 A"
                  value={registerForm.kelas}
                  onChange={handleRegisterChange}
                  leftIcon={<User size={18} />}
                  radius="full"
                  focusColor="#316e94"
                />

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Input
                    label="No. HP"
                    type="tel"
                    name="no_hp"
                    placeholder="081234567890"
                    value={registerForm.no_hp}
                    onChange={handleRegisterChange}
                    leftIcon={<User size={18} />}
                    radius="full"
                    focusColor="#316e94"
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label="Alamat"
                    type="text"
                    name="alamat"
                    placeholder="Alamat lengkap"
                    value={registerForm.alamat}
                    onChange={handleRegisterChange}
                    leftIcon={<User size={18} />}
                    radius="full"
                    focusColor="#316e94"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                variant="primary"
                bgColor="#de913e"
                hoverColor="#125475"
                className="w-full"
                type="submit"
                radius="full"
                loading={loading}
              >
                Buat Akun
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

