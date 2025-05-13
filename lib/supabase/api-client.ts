import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Maximum number of retries for database operations
const MAX_RETRIES = 3
// Delay between retries (in milliseconds)
const RETRY_DELAY = 1000

// Create a Supabase client specifically for API routes
export function createApiSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables")
    throw new Error("Missing required environment variables for Supabase connection")
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
}

// Create a singleton instance
let apiSupabaseClient: ReturnType<typeof createApiSupabaseClient> | null = null

export function getApiSupabaseClient() {
  if (!apiSupabaseClient) {
    apiSupabaseClient = createApiSupabaseClient()
  }
  return apiSupabaseClient
}

// Helper function to execute a database operation with retries
export async function withRetry<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries <= 0) throw error

    console.warn(`Database operation failed, retrying (${retries} attempts left)...`, error)
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
    return withRetry(operation, retries - 1)
  }
}
