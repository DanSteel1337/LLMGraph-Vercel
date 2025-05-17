import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Create a singleton instance of the Supabase client for client components
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>()
  }
  return supabaseClient
}

// Helper function to check if we're on the client side
export function isClient() {
  return typeof window !== "undefined"
}

// Safely create a client only on the client side
export function createSafeClient() {
  if (isClient()) {
    return getSupabaseClient()
  }
  return null
}

// Type definition for Supabase tables
export type Tables = Database["public"]["Tables"]

// IMPORTANT: Export the singleton client directly to prevent multiple instances
const supabase = isClient() ? getSupabaseClient() : null
export default supabase
