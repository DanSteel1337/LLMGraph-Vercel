import { supabaseClient } from "@/lib/supabase/client"
import type { Database } from "@/types/supabase"

// Document types
export type Document = Database["public"]["Tables"]["documents"]["Row"]
export type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"]
export type DocumentUpdate = Database["public"]["Tables"]["documents"]["Update"]

// Profile types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]

// Search history types
export type SearchHistory = Database["public"]["Tables"]["search_history"]["Row"]
export type SearchHistoryInsert = Database["public"]["Tables"]["search_history"]["Insert"]

// Document functions
export async function getDocuments() {
  const { data, error } = await supabaseClient.from("documents").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching documents:", error)
    throw error
  }

  return data
}

export async function getDocumentById(id: string) {
  const { data, error } = await supabaseClient.from("documents").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching document with id ${id}:`, error)
    throw error
  }

  return data
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

export async function getPopularSearches(limit = 5) {
  const { data, error } = await supabaseClient
    .from("search_history")
    .select("query, count(*)")
    .group("query")
    .order("count", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching popular searches:", error)
    throw error
  }

  return data
}
