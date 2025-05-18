import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { logError } from "@/lib/error-handler"

// Environment variable validation
export function validateSupabaseEnvVars() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return { url, anonKey }
}

// Create a limited client for fallback in production
export function createLimitedClient() {
  console.warn("Using limited Supabase client due to initialization error")

  // Return a mock client that logs operations but doesn't perform them
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: { message: "Client unavailable" },
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      refreshSession: async () => ({ data: { session: null }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          data: null,
          error: null,
        }),
        data: null,
        error: null,
      }),
    }),
    // Add other methods as needed
  } as any
}

// Create client with error handling
export function createSupabaseClient(customHeaders?: Record<string, string>) {
  try {
    const { url, anonKey } = validateSupabaseEnvVars()

    const client = createClient<Database>(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: customHeaders,
      },
    })

    const originalGetSession = client.auth.getSession.bind(client.auth)
    client.auth.getSession = async () => {
      try {
        const result = await originalGetSession()
        return result
      } catch (error: any) {
        if (error.message && error.message.includes("Auth session missing")) {
          console.warn("Auth session missing - user may need to log in")
          return {
            data: { session: null },
            error: null,
          }
        }
        throw error
      }
    }

    return client
  } catch (error) {
    logError(error, "supabase_client_creation_error")
    console.error("Error creating Supabase client:", error)

    if (process.env.NODE_ENV === "production") {
      return createLimitedClient()
    }

    throw error
  }
}
