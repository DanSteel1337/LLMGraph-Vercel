"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User, Session } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { useToast } from "@/components/ui/use-toast"

// Simple auth context type
type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

// Default context value
const defaultContext: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  signIn: async () => ({ success: false, error: "Auth not initialized" }),
  signOut: async () => {},
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
  const router = useRouter()
  const { toast } = useToast()

  // Create Supabase client
  const supabase = createClientComponentClient<Database>()

  // Check for session timeout
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("Auth loading timed out, setting to false")
        setIsLoading(false)
      }
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [isLoading])

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)

          // Check if user is admin (simplified - in a real app, you'd check roles)
          // This is a placeholder - implement your admin check logic here
          setIsAdmin(true)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)
      setIsAdmin(newSession !== null) // Simplified admin check
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setUser(data.user)
      setSession(data.session)
      setIsAdmin(true) // Simplified admin check

      toast({
        title: "Login successful",
        description: "Welcome back, admin!",
      })

      return { success: true }
    } catch (error: any) {
      console.error("Sign in error:", error)

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

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })

      router.push("/login")
    } catch (error) {
      console.error("Sign out error:", error)

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
    signIn,
    signOut,
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
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push("/login")
    }
  }, [user, isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
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
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  )
}

// User profile component
export function UserProfile() {
  const { user, signOut, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <button disabled className="px-4 py-2 text-sm">
        Loading...
      </button>
    )
  }

  if (!user) {
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
