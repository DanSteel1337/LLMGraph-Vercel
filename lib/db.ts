import { supabaseClient } from "@/lib/supabase/client"
import type { Database } from "@/types/supabase"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

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
  const { data, error } = await supabaseClient.from("documents").insert(document).select().single()

  if (error) {
    console.error("Error creating document:", error)
    throw error
  }

  return data
}

export async function updateDocument(id: string, document: DocumentUpdate) {
  const { data, error } = await supabaseClient.from("documents").update(document).eq("id", id).select().single()

  if (error) {
    console.error(`Error updating document with id ${id}:`, error)
    throw error
  }

  return data
}

export async function deleteDocument(id: string) {
  const { error } = await supabaseClient.from("documents").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting document with id ${id}:`, error)
    throw error
  }

  return true
}

// Profile functions
export async function getProfile(userId: string) {
  const { data, error } = await supabaseClient.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error(`Error fetching profile for user ${userId}:`, error)
    throw error
  }

  return data
}

export async function updateProfile(userId: string, profile: ProfileUpdate) {
  const { data, error } = await supabaseClient.from("profiles").update(profile).eq("id", userId).select().single()

  if (error) {
    console.error(`Error updating profile for user ${userId}:`, error)
    throw error
  }

  return data
}

// Search history functions
export async function addSearchHistory(searchHistory: SearchHistoryInsert) {
  const { data, error } = await supabaseClient.from("search_history").insert(searchHistory).select().single()

  if (error) {
    console.error("Error adding search history:", error)
    throw error
  }

  return data
}

export async function getSearchHistory(userId: string, limit = 10) {
  const { data, error } = await supabaseClient
    .from("search_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error(`Error fetching search history for user ${userId}:`, error)
    throw error
  }

  return data
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

    // Use a proper aggregation query with GROUP BY
    const { data, error } = await supabase.rpc("get_popular_searches", { limit_count: 5 })

    if (error) {
      console.error("Error fetching popular searches:", error)

      // Fallback to a simpler query if the RPC function doesn't exist
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("search_history")
        .select("query")
        .order("count", { ascending: false })
        .limit(5)

      if (fallbackError) {
        console.error("Error in fallback query:", fallbackError)
        return []
      }

      // Convert the fallback data to the expected format
      return fallbackData.map((item) => ({
        query: item.query,
        count: 1, // We don't have the actual count in this fallback
      }))
    }

    return data as unknown as { query: string; count: number }[]
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

    // Check if query already exists
    const { data, error } = await supabase.from("search_history").select("*").eq("query", query).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      console.error("Error checking search history:", error)
      return
    }

    if (data) {
      // Update existing query
      await supabase
        .from("search_history")
        .update({
          count: data.count + 1,
          last_searched_at: new Date().toISOString(),
          results_count: resultsCount,
        })
        .eq("id", data.id)
    } else {
      // Insert new query
      await supabase.from("search_history").insert({
        query,
        count: 1,
        results_count: resultsCount,
      })
    }
  } catch (error) {
    console.error("Error recording search query:", error)
  }
}
