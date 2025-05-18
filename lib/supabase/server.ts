/**
 * Supabase Server Client Module
 *
 * Provides a Supabase client for server environments.
 * Handles cookie-based authentication and provides
 * mock implementations for development environments.
 *
 * @module supabase/server
 */

import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"
import { shouldUseMockData } from "../environment"

/**
 * Create a mock Supabase server client for development
 * @returns Mock Supabase server client
 */
function createMockSupabaseServerClient() {
  return {
    auth: {
      getSession: async () => ({
        data: { session: { user: { id: "mock-user-id", email: "mock@example.com" } } },
        error: null,
      }),
      getUser: async () => ({ data: { user: { id: "mock-user-id", email: "mock@example.com" } }, error: null }),
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
 * Create a Supabase client for server environments
 * @returns Supabase server client
 */
export function createServerClient() {
  // Check if we should use mock data
  if (shouldUseMockData()) {
    console.log("[MOCK] Using mock Supabase server client")
    return createMockSupabaseServerClient()
  }

  const cookieStore = cookies()

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => {
          cookieStore.set(name, value, options)
        },
        remove: (name, options) => {
          cookieStore.set(name, "", { ...options, maxAge: 0 })
        },
      },
    },
  )
}

/**
 * Alias for createServerClient for compatibility
 * @returns Supabase server client
 */
export const createClient = createServerClient
