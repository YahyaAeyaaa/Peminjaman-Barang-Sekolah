'use client';

import { Suspense } from 'react';
import Input from '@/components/forminput';
import Button from '@/components/button';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import Link from 'next/link';
import { useLogin } from '../Login/hooks/useLogin';

function LoginForm() {
  const {
    showPassword,
    setShowPassword,
    loading,
    errors,
    formData,
    isRegistered,
    handleChange,
    handleSubmit,
  } = useLogin();

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col bg-[#f5f5f5] px-8 lg:px-16 py-8">
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
            Welcome Back!
          </h1>
          
          <p className="text-gray-500 mb-8">
            Let's get you signed in securely.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Success Message dari Register */}
            {isRegistered && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">Registrasi berhasil! Silakan login.</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="Enter Your Email Address"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<Mail size={18} />}
                radius="lg"
                focusColor="#316e94"
                required
                disabled={loading}
                error={errors.email}
              />
            </div>

            {/* Password Input */}
            <div>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="Password"
                placeholder="Your Password"
                value={formData.password}
                onChange={handleChange}
                leftIcon={<Lock size={18} />}
                radius="lg"
                required
                disabled={loading}
                focusColor="#316e94"
                error={errors.password}
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
            </div>

            {/* Submit Button */}
            <Button
              variant="primary"
              bgColor="#1a1a1a"
              hoverColor="#333333"
              type="submit"
              radius="lg"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              Log in with Email
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#f5f5f5] text-gray-500">Or</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-gray-700 font-medium">Continue with Google</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-gray-700 font-medium">Continue with Facebook</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-600">
              Don't Have an Account?{' '}
              <Link href="/register" className="text-[#316e94] hover:underline font-medium">
                Sign Up
              </Link>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#316e94] mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
