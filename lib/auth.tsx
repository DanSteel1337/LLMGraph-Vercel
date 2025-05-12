"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User, Session } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Create a default context value
const defaultAuthValue = {
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ success: false, error: "Auth not available" }),
  signOut: async () => {},
  refreshSession: async () => {},
}

// Create a context with default values
const AuthContext = createContext(defaultAuthValue)

// Safe hook that doesn't throw when used outside provider
export const useAuth = () => {
  const context = useContext(AuthContext)
  // Return default context if not within provider
  // This prevents errors during static generation
  if (context === undefined) {
    console.warn("useAuth was called outside of AuthProvider - using default values")
    return defaultAuthValue
  }
  return context
}

// Types for the auth context
export type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Only create the client in browser environments
  const supabase = isBrowser ? createClientComponentClient() : null

  useEffect(() => {
    // Skip if not in browser
    if (!isBrowser || !supabase) return

    // Check for existing session
    const checkSession = async () => {
      try {
        const {
          data: { session: activeSession },
        } = await supabase.auth.getSession()

        if (activeSession) {
          setSession(activeSession)
          setUser(activeSession.user)
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      setUser(data.user)
      setSession(data.session)

      return { success: true }
    } catch (error: any) {
      console.error("Sign in error:", error)
      return {
        success: false,
        error: error.message || "Failed to sign in. Please check your credentials and try again.",
      }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)

      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      router.push("/login")
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      setIsLoading(true)

      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      const {
        data: { session: refreshedSession },
      } = await supabase.auth.refreshSession()

      if (refreshedSession) {
        setSession(refreshedSession)
        setUser(refreshedSession.user)
      }
    } catch (error) {
      console.error("Refresh session error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signOut,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
