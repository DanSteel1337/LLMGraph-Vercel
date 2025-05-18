import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { isBrowser } from "@/lib/utils"
import { createSupabaseClient } from "./utils"

// Error message for server-side usage in browser context
const SERVER_ONLY_ERROR = "Supabase server client cannot be used in browser context"

// Track if we've already logged the "no session" message
let hasLoggedNoSession = false

/**
 * Creates a Supabase client for server-side usage
 * This should only be used in server components, API routes, or server actions
 */
export function createClient() {
  if (isBrowser()) {
    console.error(SERVER_ONLY_ERROR)
    throw new Error(SERVER_ONLY_ERROR)
  }

  const cookieStore = cookies()

  return createSupabaseServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name, options) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
    auth: {
      onAuthStateChange: (event, session) => {
        if (!session && !hasLoggedNoSession && process.env.NODE_ENV === "production") {
          console.log("[SERVER] No active session found")
          hasLoggedNoSession = true
        }
      },
    },
  })
}

/**
 * Creates a Supabase admin client with service role permissions
 * This should only be used in server contexts where admin privileges are required
 */
export function createAdminClient() {
  if (isBrowser()) {
    console.error(SERVER_ONLY_ERROR)
    throw new Error(SERVER_ONLY_ERROR)
  }

  return createSupabaseServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Retrieves a Supabase server client using cookies
 * This should be used in server contexts where Supabase client is needed
 */
export function getSupabaseServerClient() {
  const cookieStore = cookies()

  return createSupabaseClient({
    Cookie: cookieStore.toString(),
  })
}

/**
 * Export createServerClient for compatibility
 */
export const createServerClient = createSupabaseServerClient
