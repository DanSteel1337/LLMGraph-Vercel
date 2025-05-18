import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { isBrowser } from "@/lib/utils"
import { validateEnvVar } from "@/lib/env-validator"
import { logError } from "@/lib/error-handler"

// Error message for server-side usage in browser context
const SERVER_ONLY_ERROR = "Supabase server client cannot be used in browser context"

// Track if we've already logged the "no session" message
let hasLoggedNoSession = false

/**
 * Creates a Supabase client for server-side usage
 * This should only be used in server components, API routes, or server actions
 */
export function createClient() {
  try {
    if (isBrowser()) {
      console.error(SERVER_ONLY_ERROR)
      throw new Error(SERVER_ONLY_ERROR)
    }

    const cookieStore = cookies()
    const supabaseUrl = validateEnvVar("NEXT_PUBLIC_SUPABASE_URL")
    const supabaseServiceKey = validateEnvVar("SUPABASE_SERVICE_ROLE_KEY")

    return createSupabaseServerClient(supabaseUrl, supabaseServiceKey, {
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
  } catch (error) {
    if (error instanceof Error && error.message === SERVER_ONLY_ERROR) {
      throw error // Re-throw browser context error
    }

    logError(error, "supabase_server_client_creation_error")
    throw new Error(
      `Failed to create Supabase server client: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

/**
 * Creates a Supabase admin client with service role permissions
 * This should only be used in server contexts where admin privileges are required
 */
export function createAdminClient() {
  try {
    if (isBrowser()) {
      console.error(SERVER_ONLY_ERROR)
      throw new Error(SERVER_ONLY_ERROR)
    }

    const supabaseUrl = validateEnvVar("NEXT_PUBLIC_SUPABASE_URL")
    const supabaseServiceKey = validateEnvVar("SUPABASE_SERVICE_ROLE_KEY")

    return createSupabaseServerClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === SERVER_ONLY_ERROR) {
      throw error // Re-throw browser context error
    }

    logError(error, "supabase_admin_client_creation_error")
    throw new Error(
      `Failed to create Supabase admin client: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

/**
 * Retrieves a Supabase server client using cookies
 * This should be used in server contexts where Supabase client is needed
 */
export function getSupabaseServerClient() {
  try {
    if (isBrowser()) {
      console.error(SERVER_ONLY_ERROR)
      throw new Error(SERVER_ONLY_ERROR)
    }

    const cookieStore = cookies()
    const supabaseUrl = validateEnvVar("NEXT_PUBLIC_SUPABASE_URL")
    const supabaseServiceKey = validateEnvVar("SUPABASE_SERVICE_ROLE_KEY")

    return createSupabaseServerClient(supabaseUrl, supabaseServiceKey, {
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
    })
  } catch (error) {
    if (error instanceof Error && error.message === SERVER_ONLY_ERROR) {
      throw error // Re-throw browser context error
    }

    logError(error, "supabase_server_client_creation_error")
    throw new Error(
      `Failed to create Supabase server client: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

/**
 * Export createServerClient for compatibility
 */
export const createServerClient = createSupabaseServerClient
