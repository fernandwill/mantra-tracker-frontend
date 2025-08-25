/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid email profile'
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ],
  
  callbacks: {
    async signIn({ user, account }: { user: any; account: any }) {
      // Allow sign in for all verified accounts
      if (account?.provider === 'google' && user?.email_verified !== false) {
        return true
      }
      if (account?.provider === 'github') {
        return true
      }
      return true
    },
    
    async session({ session, token }: { session: any; token: any }) {
      // Add user ID and additional info to session
      if (session.user) {
        session.user.id = token.sub || token.id || ''
        session.user.provider = token.provider || 'google'
        // Ensure avatar/image is available
        if (!session.user.image && session.user.picture) {
          session.user.image = session.user.picture
        }
      }
      return session
    },
    
    async jwt({ token, user, account }: { token: any; user?: any; account?: any }) {
      // Persist additional user data in JWT
      if (user) {
        token.id = user.id
        token.provider = account?.provider
      }
      return token
    },
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin', // Redirect errors to sign in page
  },
  
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development',
}

// Use require for NextAuth to avoid TypeScript issues with Next.js 15
const NextAuth = require('next-auth').default
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }