"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: any | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUserFromCookies = async () => {
      try {
        // Check for mock token in localStorage
        const token = localStorage.getItem("auth_token")

        if (token) {
          // Mock user data
          const mockUser = {
            id: "1",
            username: "admin",
            name: "Admin User",
            role: "admin",
          }

          setUser(mockUser)
        }
      } catch (error) {
        console.error("Authentication error:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserFromCookies()
  }, [router])

  const login = async () => {
    // Mock login function
    localStorage.setItem("auth_token", "mock_token")

    // Mock user data
    const mockUser = {
      id: "1",
      username: "admin",
      name: "Admin User",
      role: "admin",
    }

    setUser(mockUser)
    router.refresh()
  }

  const logout = async () => {
    // Mock logout function
    localStorage.removeItem("auth_token")
    setUser(null)
    router.refresh()
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function isAuthenticated(): boolean {
  // Check for mock token in localStorage
  const token = localStorage.getItem("auth_token")
  return !!token
}
