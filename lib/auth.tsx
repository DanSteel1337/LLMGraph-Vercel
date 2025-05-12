"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  username: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUserFromCookies = async () => {
      try {
        // Check for user in localStorage (client-side only)
        if (typeof window !== "undefined") {
          const userStr = localStorage.getItem("user")

          if (userStr) {
            const userData = JSON.parse(userStr)
            setUser(userData)
          } else {
            // Try to fetch user data from the server
            const response = await fetch("/api/auth/me")
            if (response.ok) {
              const userData = await response.json()
              setUser(userData)
              localStorage.setItem("user", JSON.stringify(userData))
            }
          }
        }
      } catch (error) {
        console.error("Authentication error:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserFromCookies()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))
        router.refresh()
        return { success: true }
      } else {
        return { success: false, error: data.error || "Login failed" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An error occurred during login" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("user")
      setUser(null)
      router.push("/login")
      router.refresh()
    }
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
  if (typeof window === "undefined") {
    return false
  }

  // Check for user in localStorage
  const userStr = localStorage.getItem("user")
  return !!userStr
}
