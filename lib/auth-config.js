import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

// Auth config tanpa Prisma import di top level
// Prisma akan di-import secara dinamis hanya di authorize function
export const authConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Lazy load Prisma only when authorize is called (API route, not middleware)
        const { prisma } = await import('./prisma')
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        // Cek apakah user aktif
        if (!user.is_active) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
        }
      }
    })
  ],
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
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-development-only-change-in-production',
  trustHost: true,
}

