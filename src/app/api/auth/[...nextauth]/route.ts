/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ],
  
  callbacks: {
    async signIn() {
      // Handle sign in logic
      return true
    },
    
    async session({ session, token }: { session: any; token: any }) {
      // Add user ID to session
      if (session.user?.email) {
        // You can add additional user data here
        session.user.id = token.sub || ''
      }
      return session
    },
    
    async jwt({ token }: { token: any }) {
      // Persist additional user data in JWT
      return token
    },
  },
  
  pages: {
    signIn: '/auth/signin',
  },
  
  session: {
    strategy: 'jwt' as const,
  },
  
  secret: process.env.NEXTAUTH_SECRET,
}

// Use require for NextAuth to avoid TypeScript issues with Next.js 15
const NextAuth = require('next-auth').default
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }