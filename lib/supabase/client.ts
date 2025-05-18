/**
 * Supabase Client Module
 *
 * Provides a singleton Supabase client for browser context.
 * Handles client initialization, authentication, and provides
 * mock implementations for development environments.
 *
 * @module supabase/client
 */

import type { createClient } from "@supabase/supabase-js"
import { createBrowserClient as createBrowserSupabaseClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"
import { shouldUseMockData } from "../environment"
import { logError } from "../error-handler"

// Singleton instance initialization
let _instance: ReturnType<typeof createClient<Database>> | null = null

/**
 * Create a mock Supabase client for development
 * @returns Mock Supabase client
 */
function createMockSupabaseClient() {
  return {
    auth: {
      getSession: async () => ({
        data: { session: { user: { id: "mock-user-id", email: "mock@example.com" } } },
        error: null,
      }),
      getUser: async () => ({ data: { user: { id: "mock-user-id", email: "mock@example.com" } }, error: null }),
      signInWithPassword: async () => ({
        data: { user: { id: "mock-user-id", email: "mock@example.com" }, session: {} },
        error: null,
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      refreshSession: async () => ({ data: { session: {} }, error: null }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: "mock-id" }, error: null }),
          data: [{ id: "mock-id" }],
          error: null,
        }),
        order: () => ({
          limit: () => ({
            data: [{ id: "mock-id" }],
            error: null,
          }),
        }),
        data: [{ id: "mock-id" }],
        error: null,
      }),
      insert: () => ({
        select: () => ({
          data: { id: "mock-id" },
          error: null,
        }),
      }),
      update: () => ({
        eq: () => ({
          data: { id: "mock-id" },
          error: null,
        }),
      }),
      delete: () => ({
        eq: () => ({
          data: null,
          error: null,
        }),
      }),
    }),
  } as any
}

/**
 * Validate Supabase environment variables
 * @returns Object containing validated URL and anon key
 */
function validateSupabaseEnvVars() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined")
  }

  if (!anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined")
  }

  return { url, anonKey }
}

/**
 * Get the Supabase client singleton instance
 * @param customHeaders Optional custom headers
 * @returns Supabase client instance
 */
export function getSupabaseClient(customHeaders?: Record<string, string>) {
  try {
    if (!_instance) {
      // Check if we should use mock data
      if (shouldUseMockData()) {
        console.log("[MOCK] Using mock Supabase client")
        return createMockSupabaseClient() as any
      }

      // Validate environment variables
      const { url, anonKey } = validateSupabaseEnvVars()

      // Create the browser client with the required URL and API key
      _instance = createBrowserSupabaseClient<Database>(url, anonKey, {
        global: {
          headers: customHeaders,
        },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }) as any
    }
    return _instance
  } catch (error) {
    logError(error, "supabase_client_creation_error")
    console.error("Error creating Supabase client:", error)

    // Return mock client in production as fallback
    if (process.env.VERCEL_ENV === "production") {
      return createMockSupabaseClient() as any
    }

    throw error
  }
}

// Export the singleton instance
export const supabase = getSupabaseClient()
