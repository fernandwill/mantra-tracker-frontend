// Mock authentication service for development/testing
// This simulates a backend API and will be replaced with real API calls

export interface MockUser {
  id: string
  email: string
  name: string
  avatar?: string
}

// Dynamic user storage (simulates database)
const mockUsers: MockUser[] = []
let userIdCounter = 1

// Default password for development (in real app, passwords would be hashed)
const DEFAULT_DEV_PASSWORD = 'password123'

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockAuthService = {
  async login(email: string, password: string): Promise<{ user: MockUser; token: string } | null> {
    await delay(800) // Simulate network delay
    
    const user = mockUsers.find(u => u.email === email)
    
    if (user && password === DEFAULT_DEV_PASSWORD) {
      return {
        user,
        token: `mock_token_${user.id}_${Date.now()}`
      }
    }
    
    return null
  },

  async register(name: string, email: string, password: string): Promise<{ user: MockUser; token: string } | null> {
    await delay(1000) // Simulate network delay
    
    // Check if user already exists
    if (mockUsers.find(u => u.email === email)) {
      throw new Error('User already exists')
    }
    
    // Validate password (in real app, this would be more sophisticated)
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }
    
    // Create new user
    const newUser: MockUser = {
      id: String(userIdCounter++),
      email,
      name,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face`
    }
    
    mockUsers.push(newUser)
    
    return {
      user: newUser,
      token: `mock_token_${newUser.id}_${Date.now()}`
    }
  },

  // Get registered users count (for development info)
  getUserCount(): number {
    return mockUsers.length
  }
}