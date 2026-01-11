import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuthPage = req.nextUrl.pathname.startsWith('/login')
    
    // Jika sudah login dan akses halaman login, redirect ke dashboard
    if (token && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Role-based access control
    const { pathname } = req.nextUrl
    
    // Admin routes
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    // Petugas routes
    if (pathname.startsWith('/petugas') && token?.role !== 'PETUGAS' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    // Peminjam routes
    if (pathname.startsWith('/peminjam') && token?.role !== 'PEMINJAM' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page without token
        if (req.nextUrl.pathname.startsWith('/login')) {
          return true
        }
        // Require token for all other pages
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/petugas/:path*',
    '/peminjam/:path*',
    '/login',
  ]
}

