"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User, Session } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase/client"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

// Create a default context value
const defaultContextValue: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ success: false, error: "Auth context not initialized" }),
  signOut: async () => {},
  refreshSession: async () => {},
}

const AuthContext = createContext<AuthContextType>(defaultContextValue)

// Track provider mounting without using NODE_ENV
let isDevEnvironment = false
try {
  // This is a safe way to check if we're in development
  // It will be removed in production builds
  isDevEnvironment = process.env.NEXT_PUBLIC_VERCEL_ENV !== "production"
} catch (e) {
  // Ignore errors
}

// Create a singleton instance of the AuthProvider to avoid duplicate contexts
let authProviderMounted = false

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Use the singleton Supabase client
  const supabase = getSupabaseClient()

  // Warn about duplicate AuthProviders in development
  useEffect(() => {
    if (isDevEnvironment) {
      if (authProviderMounted) {
        console.warn("Multiple AuthProvider instances detected. This may cause authentication issues.")
      }
      authProviderMounted = true

      return () => {
        authProviderMounted = false
      }
    }
  }, [])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setIsLoading(true)

        // Check for mock token first
        const mockToken = localStorage.getItem("mock_auth_token")
        if (mockToken) {
          console.log("Using mock authentication")
          // Create a mock user and session
          const mockUser = {
            id: "mock-user-id",
            email: "demo@example.com",
            user_metadata: {
              full_name: "Demo User (Mock)",
            },
          } as User

          setUser(mockUser)
          setSession({ user: mockUser } as Session)
          setIsLoading(false)
          return
        }

        // Otherwise use Supabase auth
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error("Sign in error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const signOut = async () => {
    // Clear mock token if it exists
    localStorage.removeItem("mock_auth_token")

    // Sign out from Supabase
    await supabase.auth.signOut()

    // Redirect to login
    router.push("/login")
    router.refresh()
  }

  const refreshSession = async () => {
    try {
      // Check for mock token first
      const mockToken = localStorage.getItem("mock_auth_token")
      if (mockToken) {
        // No need to refresh mock session
        return
      }

      // Otherwise refresh Supabase session
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
    } catch (error) {
      console.error("Error refreshing session:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
