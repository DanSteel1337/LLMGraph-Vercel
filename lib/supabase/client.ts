import { createSupabaseClient } from "./utils"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Global singleton instance
// Using globalThis to ensure the same instance across module reloads in development
declare global {
  var supabaseClientSingleton: SupabaseClient<Database> | undefined
}

// Create and export the singleton Supabase client
export const supabase = globalThis.supabaseClientSingleton || createSupabaseClient()

// In development, preserve the instance across HMR
if (process.env.NODE_ENV !== "production") {
  globalThis.supabaseClientSingleton = supabase
}

// Legacy function for backward compatibility
export function getSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error("getSupabaseClient should only be called on the client side")
  }

  // Always return the singleton instance
  return supabase
}

// Safe client creation with improved error handling
export function createSafeClient(customHeaders?: Record<string, string>) {
  // For custom headers, we need to create a new instance
  if (customHeaders && Object.keys(customHeaders).length > 0) {
    return createSupabaseClient(customHeaders)
  }

  // Otherwise, return the singleton
  return supabase
}
