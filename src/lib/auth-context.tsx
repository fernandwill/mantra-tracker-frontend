'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  provider?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  signOut: () => void
  signIn: (user: User, token: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()

  useEffect(() => {
    // Priority 1: Check for NextAuth session (Google/GitHub sign-in)
    if (session?.user) {
      const sessionUser: User = {
        id: (session.user as { id?: string }).id || '',
        email: session.user.email || '',
        name: session.user.name || '',
        avatar: session.user.image || undefined,
        provider: (session.user as { provider?: string }).provider || 'google'
      }
      setUser(sessionUser)
      setToken(null) // NextAuth handles tokens internally
    }
    // Priority 2: Check for email/password auth token (custom auth)
    else {
      const authToken = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user')
      
      if (authToken && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          setUser({ ...parsedUser, provider: 'email' })
          setToken(authToken)
        } catch (error) {
          console.error('Error parsing stored user data:', error)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
        }
      } else {
        setUser(null)
        setToken(null)
      }
    }
    
    setIsLoading(false)
  }, [session, status])

  const signOut = async () => {
    // Clear local storage (for email auth)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    
    // Sign out from NextAuth (for Google/GitHub auth)
    if (session) {
      await nextAuthSignOut({ redirect: false })
    }
    
    setUser(null)
    setToken(null)
  }

  const signIn = (newUser: User, newToken: string) => {
    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setUser({ ...newUser, provider: 'email' })
    setToken(newToken)
  }

  const value = {
    user,
    token,
    isLoading: isLoading || status === 'loading',
    signOut,
    signIn
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}