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
        body: JSON.stringify({ code: registrationCode.trim().toUpperCase() }),
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: registrationCode.trim().toUpperCase(),
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
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col bg-[#f5f5f5] px-8 lg:px-16 py-8 overflow-y-auto">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#316e94] rounded-full"></div>
            <span className="text-black font-medium">Terserah Deh.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Profile Dev</a>
          </div>
        </nav>

        {/* Form Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h1 className="text-3xl lg:text-4xl font-bold text-black mb-2">
            Create Account
          </h1>
          
          <p className="text-gray-500 mb-6">
            Already A Member?{' '}
            <Link href="/Login" className="text-[#316e94] hover:underline font-medium">Sign In</Link>
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
                        setRegistrationCode(e.target.value.toUpperCase());
                        setCodeError('');
                      }}
                      leftIcon={<KeyRound size={18} />}
                      className="font-mono flex-1"
                      radius="full"
                      required
                      error={codeError}
                      focusColor="#316e94"
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
                radius="lg"
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
                radius="lg"
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
              radius="lg"
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
              radius="lg"
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
              radius="lg"
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
              
              <div className="space-y-4 mt-4">
                <Input
                  label="Kelas"
                  type="text"
                  name="kelas"
                  placeholder="Contoh: X-1 A"
                  value={registerForm.kelas}
                  onChange={handleRegisterChange}
                  leftIcon={<User size={18} />}
                  radius="lg"
                  focusColor="#316e94"
                />

                <Input
                  label="No. HP"
                  type="tel"
                  name="no_hp"
                  placeholder="081234567890"
                  value={registerForm.no_hp}
                  onChange={handleRegisterChange}
                  leftIcon={<User size={18} />}
                  radius="lg"
                  focusColor="#316e94"
                />

                <Input
                  label="Alamat"
                  type="text"
                  name="alamat"
                  placeholder="Alamat lengkap"
                  value={registerForm.alamat}
                  onChange={handleRegisterChange}
                  leftIcon={<User size={18} />}
                  radius="lg"
                  focusColor="#316e94"
                />
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
                bgColor="#1a1a1a"
                hoverColor="#333333"
                className="w-full"
                type="submit"
                radius="lg"
                loading={loading}
              >
                Create Account
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-400">
          Terserah Deh. 2030
        </div>
      </div>

      {/* Right Side - Image with Quote */}
      <div className="hidden lg:flex flex-1 relative bg-gray-900">
        {/* Background Image */}
        <img
          src="/image/slava-auchynnikau-l4MfcEX62E0-unsplash.jpg"
          alt="Mountain landscape"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50"></div>
        
        {/* Quote Card */}
        <div className="absolute bottom-12 left-12 right-12 bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <User className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-1">John Muir</h3>
              <p className="text-gray-200 text-sm leading-relaxed italic">
                "Explore untouched landscapes, breathtaking trails, and hidden wonders of nature."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}