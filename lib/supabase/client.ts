// This is a browser-only file
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Create a true singleton for the Supabase client
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const getSupabaseClient = () => {
  if (typeof window === "undefined") {
    // We're on the server - create a new instance each time
    // This is safe because server has different contexts for each request
    return createClientComponentClient<Database>()
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
