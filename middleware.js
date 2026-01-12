import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'

// Auth config minimal untuk middleware (tanpa Prisma)
// Middleware hanya membaca session dari cookie, tidak perlu provider
const middlewareAuthConfig = {
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.email = user.email
        token.first_name = user.first_name
        token.last_name = user.last_name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.email = token.email
        session.user.first_name = token.first_name
        session.user.last_name = token.last_name
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const { auth } = NextAuth(middlewareAuthConfig)

export default auth((req) => {
  const session = req.auth
  const { pathname } = req.nextUrl
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  
  // Jika sudah login dan akses halaman auth, redirect ke dashboard
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Jika belum login dan akses protected route, redirect ke login
  if (!session && !isAuthPage && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Role-based access control
  const userRole = session?.user?.role
  
  // Admin routes
  if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  // Petugas routes
  if (pathname.startsWith('/petugas') && userRole !== 'PETUGAS' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  // Peminjam routes
  if (pathname.startsWith('/peminjam') && userRole !== 'PEMINJAM' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/petugas/:path*',
    '/peminjam/:path*',
    '/login',
    '/register',
  ]
}
