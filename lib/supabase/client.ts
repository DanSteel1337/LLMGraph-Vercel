// This file should only be imported in client components
// Add "use client" directive to ensure it's not used in server components
"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Create a singleton for the Supabase client
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const getSupabaseClient = () => {
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
