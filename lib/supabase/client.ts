import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Create a true singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const getSupabaseClient = () => {
  if (typeof window === "undefined") {
    // Server-side: Always create a new instance
    return createClientComponentClient<Database>()
  }

  // Client-side: Use singleton pattern
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient<Database>()
  }
  return supabaseInstance
}

// Export the singleton getter function
export const supabaseClient = getSupabaseClient()
