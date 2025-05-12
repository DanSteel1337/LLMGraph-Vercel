import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Create a true singleton for the Supabase client
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const getSupabaseClient = () => {
  // Only create the client in browser environments
  if (!isBrowser) {
    // Return a mock client or null for server environment
    // This prevents "self is not defined" errors
    return null
  }

  // We're on the client - use singleton pattern
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient<Database>({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  }

  return supabaseInstance
}

// Export the singleton getter function
export const supabaseClient = getSupabaseClient()
