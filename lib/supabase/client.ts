import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { validateClientEnvVar } from "@/lib/env-validator"
import { logError } from "@/lib/error-handler"

// Global singleton instance
// Using globalThis to ensure the same instance across module reloads in development
declare global {
  var supabaseClientSingleton: SupabaseClient<Database> | undefined
}

// Create and export the singleton Supabase client
export function createSupabaseClient(customHeaders?: Record<string, string>): SupabaseClient<Database> {
  try {
    const supabaseUrl = validateClientEnvVar("SUPABASE_URL")
    const supabaseKey = validateClientEnvVar("SUPABASE_ANON_KEY")

    return createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: customHeaders,
      },
    })
  } catch (error) {
    logError(error, "supabase_client_creation_error")
    throw new Error(`Failed to create Supabase client: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Get the singleton instance or create it if it doesn't exist
export function getSupabaseClient(customHeaders?: Record<string, string>): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    // Server-side: always create a new client to avoid sharing between requests
    return createSupabaseClient(customHeaders)
  }

  // Client-side: use the singleton
  if (!globalThis.supabaseClientSingleton) {
    globalThis.supabaseClientSingleton = createSupabaseClient(customHeaders)
  }

  return customHeaders
    ? createSupabaseClient(customHeaders) // If custom headers are provided, create a new instance
    : globalThis.supabaseClientSingleton
}

// Export the singleton instance directly
export const supabase = getSupabaseClient()

// Legacy function for backward compatibility
export function createSafeClient(customHeaders?: Record<string, string>) {
  console.warn("createSafeClient is deprecated, use getSupabaseClient instead")
  return getSupabaseClient(customHeaders)
}
