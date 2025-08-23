'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
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
    // Check for email/password auth token
    const authToken = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user')
    
    if (authToken && userData) {
      setToken(authToken)
      setUser(JSON.parse(userData))
    } else if (session?.user) {
      // Handle NextAuth session
      setUser({
        id: (session.user as { id?: string }).id || '',
        email: session.user.email || '',
        name: session.user.name || '',
        avatar: session.user.image || undefined
      })
    }
    
    setIsLoading(false)
  }, [session])

  const signOut = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
  }

  const signIn = (newUser: User, newToken: string) => {
    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setUser(newUser)
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