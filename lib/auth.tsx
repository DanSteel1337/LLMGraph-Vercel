"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User, Session } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Types for the auth context
export type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

// Create a default context value
const defaultAuthValue: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ success: false, error: "Auth not available" }),
  signOut: async () => {},
  refreshSession: async () => {},
}

// Create a context with default values
const AuthContext = createContext<AuthContextType>(defaultAuthValue)

// Safe hook that doesn't throw when used outside provider
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    console.error("useAuth must be used within an AuthProvider")
    return defaultAuthValue
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Create the Supabase client directly in the component
  const supabase = createClientComponentClient<Database>()

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("Auth still loading after timeout, forcing isLoading to false")
        setIsLoading(false)
      }
    }, 5000)

    return () => clearTimeout(timeoutId)
  }, [isLoading])

  useEffect(() => {
    console.log("AuthProvider mounted, initializing Supabase auth")

    // Check for existing session
    const checkSession = async () => {
      try {
        console.log("Checking for existing session...")
        const {
          data: { session: activeSession },
        } = await supabase.auth.getSession()

        console.log("Session check result:", activeSession ? "Session found" : "No session")

        if (activeSession) {
          setSession(activeSession)
          setUser(activeSession.user)
        }

        // Always set loading to false after checking session
        setIsLoading(false)
      } catch (error) {
        console.error("Error checking session:", error)
        setIsLoading(false)
      }
    }

    checkSession()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log("Auth state changed:", _event, newSession ? "Session exists" : "No session")
      setSession(newSession)
      setUser(newSession?.user || null)
      setIsLoading(false)
    })

    return () => {
      console.log("AuthProvider unmounting, unsubscribing from auth changes")
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in for:", email)
      setIsLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error)
        throw error
      }

      console.log("Sign in successful:", data.user?.email)
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
      console.log("Attempting sign out")
      setIsLoading(true)

      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      router.push("/login")
      console.log("Sign out successful")
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      console.log("Attempting to refresh session")
      setIsLoading(true)

      const {
        data: { session: refreshedSession },
      } = await supabase.auth.refreshSession()

      if (refreshedSession) {
        console.log("Session refreshed successfully")
        setSession(refreshedSession)
        setUser(refreshedSession.user)
      } else {
        console.log("No session to refresh")
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

  console.log("AuthProvider rendering with state:", {
    hasUser: !!user,
    hasSession: !!session,
    isLoading,
  })

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
