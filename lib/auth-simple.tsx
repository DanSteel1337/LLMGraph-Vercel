"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User, Session } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { logError } from "@/lib/error-handler"
import { debounce } from "@/lib/utils"

// Simple auth context type
type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  isExpired: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<boolean>
}

// Default context value
const defaultContext: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  isExpired: false,
  signIn: async () => ({ success: false, error: "Auth not initialized" }),
  signOut: async () => {},
  refreshSession: async () => false,
}

// Create the auth context
const AuthContext = createContext<AuthContextType>(defaultContext)

// Auth provider props
interface AuthProviderProps {
  children: ReactNode
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Track if we've already logged the "no session" message
  const hasLoggedNoSession = useRef(false)
  // Track auth subscription to avoid duplicate listeners
  const authSubscription = useRef<{ unsubscribe: () => void } | null>(null)

  // Check if session is expired
  const checkSessionExpiration = (session: Session | null) => {
    if (!session) return true

    // Check if session has expires_at property
    if (session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000)
      return expiresAt < new Date()
    }

    return false
  }

  // Set up session expiration timer
  const setupExpirationTimer = (session: Session | null) => {
    if (!session || !session.expires_at) return undefined

    const expiresAt = new Date(session.expires_at * 1000)
    const timeUntilExpiry = expiresAt.getTime() - Date.now()

    if (timeUntilExpiry > 0) {
      return setTimeout(() => {
        setIsExpired(true)
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        })
      }, timeUntilExpiry)
    }

    return undefined
  }

  // Check for session timeout
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("Auth loading timed out, setting to false")
        setIsLoading(false)
      }
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [isLoading])

  // Debounced session fetch to avoid multiple calls
  const debouncedFetchSession = useRef(
    debounce(async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          // Handle 401 and other auth errors
          if (error.status === 401) {
            console.warn("Authentication session expired or invalid")
            setIsExpired(true)
          } else {
            logError(error, "auth_session_error")
          }
          setSession(null)
          setUser(null)
          setIsLoading(false)
          return
        }

        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)

          // Check if session is expired
          const expired = checkSessionExpiration(currentSession)
          setIsExpired(expired)

          // Check if user is admin (simplified - in a real app, you'd check roles)
          setIsAdmin(!expired)

          // Set up expiration timer
          setupExpirationTimer(currentSession)
        } else {
          // Only log once in production
          if (!hasLoggedNoSession.current && process.env.NODE_ENV === "production") {
            console.log("No active session found")
            hasLoggedNoSession.current = true
          }

          setSession(null)
          setUser(null)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        logError(error, "auth_init_error")

        // Set fallback state for auth failure
        setSession(null)
        setUser(null)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }, 100),
  ).current

  // Initialize auth state
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    // Clean up previous subscription if it exists
    if (authSubscription.current?.unsubscribe) {
      authSubscription.current.unsubscribe()
      authSubscription.current = null
    }

    // Fetch session (debounced)
    debouncedFetchSession()

    // Set up auth state listener
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)

      // Check if session is expired
      const expired = checkSessionExpiration(newSession)
      setIsExpired(expired)

      // Check if user is admin
      setIsAdmin(newSession !== null && !expired)

      // Set up expiration timer
      setupExpirationTimer(newSession)

      setIsLoading(false)
    })

    // Store subscription reference
    authSubscription.current = subscription

    return () => {
      // Clean up subscription
      if (authSubscription.current?.unsubscribe) {
        authSubscription.current.unsubscribe()
        authSubscription.current = null
      }
    }
  }, [debouncedFetchSession])

  // Refresh session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        // Log warning instead of error for missing session
        if (error.message.includes("Auth session missing")) {
          // Only log in development
          if (process.env.NODE_ENV !== "production") {
            console.warn("Session refresh warning: Auth session missing")
          }

          // Set proper fallback state
          setSession(null)
          setUser(null)
          setIsAdmin(false)
          setIsExpired(false)
          return false
        }

        console.error("Session refresh error:", error)
        return false
      }

      if (data.session) {
        setSession(data.session)
        setUser(data.session.user)
        setIsExpired(false)
        return true
      }

      return false
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV !== "production") {
        console.warn("Session refresh warning:", error)
      }

      // Set proper fallback state
      setSession(null)
      setUser(null)
      setIsAdmin(false)
      return false
    }
  }

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Handle 401 and other auth errors
        if (error.status === 401) {
          return {
            success: false,
            error: "Invalid credentials. Please check your email and password.",
          }
        }

        throw error
      }

      setUser(data.user)
      setSession(data.session)
      setIsExpired(false)
      setIsAdmin(true) // Simplified admin check

      toast({
        title: "Login successful",
        description: "Welcome back, admin!",
      })

      return { success: true }
    } catch (error: any) {
      console.error("Sign in error:", error)
      logError(error, "auth_signin_error")

      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials",
      })

      return {
        success: false,
        error: error.message || "Authentication failed",
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true)

      await supabase.auth.signOut()

      setUser(null)
      setSession(null)
      setIsAdmin(false)
      setIsExpired(false)

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })

      router.push("/login")
    } catch (error) {
      console.error("Sign out error:", error)
      logError(error, "auth_signout_error")

      toast({
        variant: "destructive",
        title: "Logout error",
        description: "An error occurred while logging out.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Auth context value
  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAdmin,
    isExpired,
    signIn,
    signOut,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Auth hook
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

// Protected route component
interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAdmin, isLoading, isExpired, refreshSession } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    const checkAuth = async () => {
      if (isExpired) {
        // Try to refresh the session
        const refreshed = await refreshSession()
        if (!refreshed) {
          router.push("/login")
        }
      } else if (!isLoading && (!user || !isAdmin)) {
        router.push("/login")
      }
    }

    checkAuth()
  }, [user, isAdmin, isLoading, isExpired, refreshSession, router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isExpired) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Session Expired</h2>
          <p className="mt-2 text-muted-foreground">Your session has expired. Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return <>{children}</>
}

// Simple login form component
interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signIn, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    try {
      const { success } = await signIn(email, password)

      if (success) {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/")
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  )
}

// User profile component
export function UserProfile() {
  const { user, signOut, isLoading, isExpired, refreshSession } = useAuth()
  const router = useRouter()

  // Handle expired session
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    if (isExpired && user) {
      refreshSession().catch(console.error)
    }
  }, [isExpired, user, refreshSession])

  if (isLoading) {
    return (
      <button disabled className="px-4 py-2 text-sm">
        Loading...
      </button>
    )
  }

  if (!user || isExpired) {
    return (
      <button onClick={() => router.push("/login")} className="px-4 py-2 text-sm">
        Login
      </button>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm hidden md:inline">{user.email}</span>
      <button onClick={() => signOut()} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md">
        Logout
      </button>
    </div>
  )
}
