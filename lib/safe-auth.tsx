"use client"

import { useContext, createContext } from "react"
import type { User, Session } from "@supabase/supabase-js"

// Create a default context value
const defaultAuthValue = {
  user: null,
  session: null,
  isLoading: false,
  signIn: async () => ({ success: false, error: "Auth not available" }),
  signOut: async () => {},
  refreshSession: async () => {},
}

// Create a context with default values
const SafeAuthContext = createContext(defaultAuthValue)

// Safe hook that doesn't throw when used outside provider
export function useSafeAuth() {
  return useContext(SafeAuthContext)
}

// Types for the auth context
export type SafeAuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}
