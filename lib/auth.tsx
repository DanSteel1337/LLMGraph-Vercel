"use client"

import type React from "react"

import { useEffect, useState, createContext, useContext } from "react"
import type { User } from "@supabase/supabase-js"
import { supabaseClient } from "./supabase/client"

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: any | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Skip auth check during SSR to avoid hydration mismatch
    if (typeof window === "undefined") {
      return
    }

    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession()
        setUser(session?.user || null)
        setIsAuthenticated(!!session?.user)
      } catch (error) {
        console.error("Error checking auth status:", error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setIsAuthenticated(!!session?.user)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error("Error signing in:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabaseClient.auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    if (typeof window !== "undefined") {
      console.warn("useAuth must be used within an AuthProvider")
    }
    // Return a default value for SSR
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      signIn: async () => ({ error: new Error("AuthProvider not found") }),
      signOut: async () => {},
    }
  }
  return context
}
