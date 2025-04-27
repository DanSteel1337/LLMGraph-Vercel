"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

// Define user type
export interface User {
  id: string
  username: string
  name: string
  role: string
}

// Define auth context type
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => false,
  logout: async () => {},
})

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, this would call an API
        // For now, just check if there's a token in localStorage
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("auth_token")

          if (token) {
            // Mock user data
            setUser({
              id: "1",
              username: "admin",
              name: "Admin User",
              role: "admin",
            })
          } else {
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    // Only run in the browser
    if (typeof window !== "undefined") {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [])

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)

      // In a real app, this would call an API
      if (username === "admin" && password === "password123") {
        // Set a mock token in localStorage
        localStorage.setItem("auth_token", "mock_token")

        // Set user data
        setUser({
          id: "1",
          username: "admin",
          name: "Admin User",
          role: "admin",
        })

        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setLoading(true)

      // In a real app, this would call an API
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
      }

      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  return context
}

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  const token = localStorage.getItem("auth_token")
  return !!token
}
