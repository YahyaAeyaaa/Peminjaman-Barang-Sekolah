'use client';

import { useState } from 'react';
import Input from '@/components/forminput';
import Button from '@/components/button';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import Link from 'next/link';
import { registerSchema } from './validateRegis';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [registerForm, setRegisterForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
  });

  // Handle register (MOCK - untuk tampilan dulu)
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

    // Simulasi delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock: Simulasi success
    console.log('Register data:', result.data);
    
    // Untuk testing, bisa uncomment ini untuk lihat success state
    // alert('Registrasi berhasil! (Mock)');
    // window.location.href = '/login?registered=true';
    
    setLoading(false);
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
      <div className="flex-1 flex flex-col bg-white px-12 py-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
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
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
          </h1>
          
          <p className="text-gray-400 mb-8">
            Already A Member?{' '}
            <Link href="/Login" className="text-blue-500 hover:underline">Sign In</Link>
          </p>

          {/* Form Registrasi */}
          <form onSubmit={handleRegister} className="space-y-4">

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
                  focusColor="#3b82f6"
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
                  focusColor="#3b82f6"
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
                focusColor="#3b82f6"
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
                focusColor="#3b82f6"
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
                focusColor="#3b82f6"
              />

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
                bgColor="#3b82f6"
                hoverColor="#2563eb"
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
          src="/image/redd-francisco-gdQnsMbhkUs-unsplash.jpg"
          alt="Scenic background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Wavy white overlay - SMOOTH CURVE */}
        <div 
          className="absolute left-0 top-0 w-4/5 h-full bg-gradient-to-r from-white via-white/95 to-transparent"
          style={{
            clipPath: `path('M 0 0 C 120 100, 80 200, 150 300 C 200 380, 60 460, 130 550 C 180 620, 70 700, 120 800 L 0 800 Z')`
          }}
        />
      </div>
    </div>
  );
}

