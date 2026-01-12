'use client';

import { useState } from 'react';
import Input from '@/components/forminput';
import Button from '@/components/button';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', formData);
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
        <div className="flex-1 flex flex-col justify-center max-w-xl mx-40">
          <h1 className="text-4xl font-bold text-black mb-2">
            Login.
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
          </h1>
          
          <p className="text-gray-400 mb-8">
            Not A Member?{' '}
            <Link href="/" className="text-blue-500 hover:underline">Sign Up</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail size={18} />}
              radius="full"
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              leftIcon={<Lock size={18} />}
              radius="full"
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

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                radius='full'
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Change method');
                }}
              >
                Change method
              </Button>
              <Button
                variant="primary"
                bgColor="#3b82f6"
                hoverColor="#2563eb"
                type="submit"
                radius='full'
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

