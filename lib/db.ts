import { supabaseClient } from "@/lib/supabase/client"
import { getApiSupabaseClient, withRetry } from "@/lib/supabase/api-client"
import type { Database } from "@/types/supabase"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { isServer } from "@/lib/utils"

// Document types
export type Document = {
  id: string
  title: string
  content: string
  category: string
  user_id: string
  created_at: string
  updated_at: string
  metadata: {
    version: string
    description: string
    tags: string[]
    filename: string
    size: number
    chunkCount: number
  }
}
export type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"]
export type DocumentUpdate = Database["public"]["Tables"]["documents"]["Update"]

// Profile types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]

// Search history types
export type SearchHistory = Database["public"]["Tables"]["search_history"]["Row"]
export type SearchHistoryInsert = Database["public"]["Tables"]["search_history"]["Insert"]

// Get the appropriate Supabase client based on the execution context
function getSupabase() {
  if (isServer()) {
    return getApiSupabaseClient()
  }
  return supabaseClient
}

// Document functions
export async function getDocuments(): Promise<Document[]> {
  try {
    const supabase = createClientComponentClient<Database>()
    const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching documents:", error)
      return []
    }

    return data as unknown as Document[]
  } catch (error) {
    console.error("Error fetching documents:", error)
    return []
  }
}

export async function getDocumentCount(): Promise<number> {
  try {
    const supabase = createClientComponentClient<Database>()
    const { count, error } = await supabase.from("documents").select("*", { count: "exact", head: true })

    if (error) {
      console.error("Error counting documents:", error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error("Error counting documents:", error)
    return 0
  }
}

export async function getDocumentById(id: string): Promise<Document | null> {
  try {
    const supabase = createClientComponentClient<Database>()
    const { data, error } = await supabase.from("documents").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching document:", error)
      return null
    }

    return data as unknown as Document
  } catch (error) {
    console.error("Error fetching document:", error)
    return null
  }
}

export async function createDocument(document: DocumentInsert) {
  const supabase = getSupabase()

  try {
    const { data, error } = await withRetry(async () => {
      return await supabase.from("documents").insert(document).select().single()
    })

    if (error) {
      console.error("Error creating document:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error creating document after retries:", error)
    throw error
  }
}

export async function updateDocument(id: string, document: DocumentUpdate) {
  const supabase = getSupabase()

  try {
    const { data, error } = await withRetry(async () => {
      return await supabase.from("documents").update(document).eq("id", id).select().single()
    })

    if (error) {
      console.error(`Error updating document with id ${id}:`, error)
      throw error
    }

    return data
  } catch (error) {
    console.error(`Error updating document with id ${id} after retries:`, error)
    throw error
  }
}

export async function deleteDocument(id: string) {
  const supabase = getSupabase()

  try {
    const { error } = await withRetry(async () => {
      return await supabase.from("documents").delete().eq("id", id)
    })

    if (error) {
      console.error(`Error deleting document with id ${id}:`, error)
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error deleting document with id ${id} after retries:`, error)
    throw error
  }
}

// Profile functions
export async function getProfile(userId: string) {
  const supabase = getSupabase()

  try {
    const { data, error } = await withRetry(async () => {
      return await supabase.from("profiles").select("*").eq("id", userId).single()
    })

    if (error) {
      console.error(`Error fetching profile for user ${userId}:`, error)
      throw error
    }

    return data
  } catch (error) {
    console.error(`Error fetching profile for user ${userId} after retries:`, error)
    throw error
  }
}

export async function updateProfile(userId: string, profile: ProfileUpdate) {
  const supabase = getSupabase()

  try {
    const { data, error } = await withRetry(async () => {
      return await supabase.from("profiles").update(profile).eq("id", userId).select().single()
    })

    if (error) {
      console.error(`Error updating profile for user ${userId}:`, error)
      throw error
    }

    return data
  } catch (error) {
    console.error(`Error updating profile for user ${userId} after retries:`, error)
    throw error
  }
}

// Search history functions
export async function addSearchHistory(searchHistory: SearchHistoryInsert) {
  const supabase = getSupabase()

  try {
    const { data, error } = await withRetry(async () => {
      return await supabase.from("search_history").insert(searchHistory).select().single()
    })

    if (error) {
      console.error("Error adding search history:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error adding search history after retries:", error)
    throw error
  }
}

export async function getSearchHistory(userId: string, limit = 10) {
  const supabase = getSupabase()

  try {
    const { data, error } = await withRetry(async () => {
      return await supabase
        .from("search_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)
    })

    if (error) {
      console.error(`Error fetching search history for user ${userId}:`, error)
      throw error
    }

    return data
  } catch (error) {
    console.error(`Error fetching search history for user ${userId} after retries:`, error)
    throw error
  }
}

export async function getSearchCount(): Promise<number> {
  try {
    const supabase = createClientComponentClient<Database>()
    const { count, error } = await supabase.from("search_history").select("*", { count: "exact", head: true })

    if (error) {
      console.error("Error counting searches:", error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error("Error counting searches:", error)
    return 0
  }
}

export async function getPopularSearches(): Promise<{ query: string; count: number }[]> {
  try {
    const supabase = createClientComponentClient<Database>()

    // Use our new SQL function
    const { data, error } = await supabase.rpc("get_popular_searches", { limit_count: 5 })

    if (error) {
      console.error("Error fetching popular searches:", error)
      return []
    }

    return data as { query: string; count: number }[]
  } catch (error) {
    console.error("Error fetching popular searches:", error)
    return []
  }
}

// Feedback functions
export async function getFeedbackCount(): Promise<number> {
  try {
    const supabase = createClientComponentClient<Database>()
    const { count, error } = await supabase.from("feedback").select("*", { count: "exact", head: true })

    if (error) {
      console.error("Error counting feedback:", error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error("Error counting feedback:", error)
    return 0
  }
}

// Get category distribution
export async function getCategoryDistribution(): Promise<{ name: string; count: number; percentage: number }[]> {
  try {
    const supabase = createClientComponentClient<Database>()
    const { data, error } = await supabase.from("documents").select("category")

    if (error) {
      console.error("Error fetching category distribution:", error)
      return []
    }

    const categories = data.map((doc) => doc.category)
    const categoryCounts: Record<string, number> = {}

    categories.forEach((category) => {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })

    const totalDocs = categories.length

    return Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalDocs) * 100),
    }))
  } catch (error) {
    console.error("Error fetching category distribution:", error)
    return []
  }
}

// Record search query
export async function recordSearchQuery(query: string, resultsCount: number): Promise<void> {
  try {
    const supabase = createClientComponentClient<Database>()

    // Since there's no count column, we'll just insert a new record each time
    // This way our get_popular_searches function can count occurrences
    await supabase.from("search_history").insert({
      query,
      results_count: resultsCount,
      // Generate a random UUID for the id
      id: crypto.randomUUID(),
      // user_id can be null according to the schema
    })
  } catch (error) {
    console.error("Error recording search query:", error)
  }
}
