import axios from 'axios';

// Base URL untuk API
// Untuk Next.js API Routes (internal), pakai relative path '/api'
// Untuk external API (Laravel dll), set NEXT_PUBLIC_API_URL di .env
// Jika NEXT_PUBLIC_API_URL tidak di-set, default ke '/api' (relative path untuk Next.js)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL || '/api', // Jika kosong, pakai '/api' untuk relative path
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
  withCredentials: true, // Untuk NextAuth cookies
});

// Request interceptor - untuk inject token dll
api.interceptors.request.use(
  (config) => {
    // Hanya akses localStorage di client-side (browser)
    if (typeof window !== 'undefined') {
      // Jika pakai external API yang butuh token (bukan NextAuth)
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - untuk handle error global
api.interceptors.response.use(
  (response) => {
    // Return data langsung jika response format {success: true, data: ...}
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    // Handle error
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Handle 401 Unauthorized - redirect ke login
      if (status === 401) {
        // Next.js: bisa redirect ke login
        if (typeof window !== 'undefined') {
          window.location.href = '/Login';
        }
      }

      // Return error dengan format konsisten
      return Promise.reject({
        message: data?.error || data?.message || 'Terjadi kesalahan',
        status,
        data: data?.data || null,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: 'Tidak ada koneksi ke server',
        status: null,
        data: null,
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'Terjadi kesalahan',
        status: null,
        data: null,
      });
    }
  }
);

export default api;

