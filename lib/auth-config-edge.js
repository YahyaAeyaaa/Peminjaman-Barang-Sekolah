// Auth config untuk Edge Runtime (middleware)
// Tidak boleh menggunakan Prisma atau adapter database di sini
import Credentials from 'next-auth/providers/credentials'

export const authConfigEdge = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      // authorize tidak akan dipanggil di middleware, hanya untuk type safety
      async authorize() {
        return null
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
    signIn: '/Login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-development-only-change-in-production',
  trustHost: true,
}

