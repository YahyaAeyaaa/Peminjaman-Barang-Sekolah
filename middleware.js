import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Public routes - tidak perlu auth
  const publicRoutes = ['/Login', '/register', '/'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get token dari JWT (NextAuth)
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-development-only-change-in-production'
  });

  // Protected routes - perlu login
  const protectedRoutes = {
    '/admin': ['ADMIN'],
    '/petugas': ['ADMIN', 'PETUGAS'],
    '/peminjam': ['ADMIN', 'PETUGAS', 'PEMINJAM'],
  };

  // Cek apakah pathname termasuk protected route
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      // Jika belum login, redirect ke login
      if (!token) {
        const loginUrl = new URL('/Login', req.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Cek role
      const userRole = token.role;
      if (!allowedRoles.includes(userRole)) {
        // Role tidak sesuai, redirect ke dashboard sesuai role
        let redirectUrl = '/Login';
        if (userRole === 'ADMIN') redirectUrl = '/admin';
        else if (userRole === 'PETUGAS') redirectUrl = '/petugas';
        else if (userRole === 'PEMINJAM') redirectUrl = '/peminjam';
        
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }

      // Role sesuai, lanjutkan
      return NextResponse.next();
    }
  }

  // Route lainnya, lanjutkan
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/petugas/:path*',
    '/peminjam/:path*',
    '/Login',
    '/register',
  ],
};
