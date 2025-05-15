// Database utility functions
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Use environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// Mock data for development when USE_MOCK_DATA is true
const MOCK_DOCUMENTS = [
  {
    id: "1",
    title: "Getting Started with Unreal Engine",
    content: "This guide will help you get started with Unreal Engine...",
    created_at: new Date().toISOString(),
    category: "Beginner",
  },
  {
    id: "2",
    title: "Blueprint Basics",
    content: "Learn the fundamentals of Blueprint visual scripting...",
    created_at: new Date().toISOString(),
    category: "Programming",
  },
  {
    id: "3",
    title: "Material System Overview",
    content: "Understanding the material system in Unreal Engine...",
    created_at: new Date().toISOString(),
    category: "Graphics",
  },
]

const MOCK_SEARCH_RESULTS = [
  {
    id: "1",
    title: "Getting Started with Unreal Engine",
    content: "This guide will help you get started with Unreal Engine...",
    score: 0.95,
  },
  {
    id: "2",
    title: "Blueprint Basics",
    content: "Learn the fundamentals of Blueprint visual scripting...",
    score: 0.85,
  },
  {
    id: "3",
    title: "Material System Overview",
    content: "Understanding the material system in Unreal Engine...",
    score: 0.75,
  },
]

const MOCK_DOCUMENT_CHUNKS = [
  {
    id: "chunk_1_1",
    document_id: "1",
    content: "This guide will help you get started with Unreal Engine...",
    chunk_index: 0,
  },
  {
    id: "chunk_1_2",
    document_id: "1",
    content: "First, download and install the Epic Games Launcher...",
    chunk_index: 1,
  },
  {
    id: "chunk_2_1",
    document_id: "2",
    content: "Learn the fundamentals of Blueprint visual scripting...",
    chunk_index: 0,
  },
]

const MOCK_POPULAR_SEARCHES = [
  { query: "blueprints", count: 120 },
  { query: "materials", count: 95 },
  { query: "animation", count: 87 },
  { query: "lighting", count: 76 },
  { query: "physics", count: 65 },
]

const MOCK_CATEGORY_DISTRIBUTION = [
  { category: "Beginner", count: 45 },
  { category: "Programming", count: 78 },
  { category: "Graphics", count: 56 },
  { category: "Animation", count: 34 },
  { category: "Physics", count: 23 },
]

// Database operations with mock fallbacks
export async function getDocuments() {
  if (process.env.USE_MOCK_DATA === "true") {
    return { data: MOCK_DOCUMENTS, error: null }
  }

  try {
    const supabase = getSupabaseClient()
    return await supabase.from("documents").select("*")
  } catch (error) {
    console.error("Error fetching documents:", error)
    return { data: null, error }
  }
}

export async function getDocumentById(id: string) {
  if (process.env.USE_MOCK_DATA === "true") {
    const document = MOCK_DOCUMENTS.find((doc) => doc.id === id)
    return { data: document || null, error: document ? null : new Error("Document not found") }
  }

  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("documents").select("*").eq("id", id).single()
    return { data, error }
  } catch (error) {
    console.error(`Error fetching document with id ${id}:`, error)
    return { data: null, error }
  }
}

export async function getDocumentChunks(documentId: string) {
  if (process.env.USE_MOCK_DATA === "true") {
    const chunks = MOCK_DOCUMENT_CHUNKS.filter((chunk) => chunk.document_id === documentId)
    return { data: chunks, error: null }
  }

  try {
    const supabase = getSupabaseClient()
    return await supabase.from("document_chunks").select("*").eq("document_id", documentId).order("chunk_index")
  } catch (error) {
    console.error(`Error fetching chunks for document ${documentId}:`, error)
    return { data: null, error }
  }
}

export async function searchDocuments(query: string) {
  if (process.env.USE_MOCK_DATA === "true") {
    return { data: MOCK_SEARCH_RESULTS, error: null }
  }

  try {
    // In a real implementation, this would use Pinecone or another vector search
    // For now, we'll just return mock data
    return { data: MOCK_SEARCH_RESULTS, error: null }
  } catch (error) {
    console.error("Error searching documents:", error)
    return { data: null, error }
  }
}

export async function createDocument(document: { title: string; content: string; category?: string }) {
  if (process.env.USE_MOCK_DATA === "true") {
    const newDocument = {
      id: (MOCK_DOCUMENTS.length + 1).toString(),
      ...document,
      created_at: new Date().toISOString(),
      category: document.category || "Uncategorized",
    }
    MOCK_DOCUMENTS.push(newDocument)
    return { data: newDocument, error: null }
  }

  try {
    const supabase = getSupabaseClient()
    return await supabase.from("documents").insert(document).select().single()
  } catch (error) {
    console.error("Error creating document:", error)
    return { data: null, error }
  }
}

export async function updateDocument(id: string, document: { title?: string; content?: string; category?: string }) {
  if (process.env.USE_MOCK_DATA === "true") {
    const index = MOCK_DOCUMENTS.findIndex((doc) => doc.id === id)
    if (index === -1) {
      return { data: null, error: new Error("Document not found") }
    }
    MOCK_DOCUMENTS[index] = { ...MOCK_DOCUMENTS[index], ...document }
    return { data: MOCK_DOCUMENTS[index], error: null }
  }

  try {
    const supabase = getSupabaseClient()
    return await supabase.from("documents").update(document).eq("id", id).select().single()
  } catch (error) {
    console.error(`Error updating document with id ${id}:`, error)
    return { data: null, error }
  }
}

export async function deleteDocument(id: string) {
  if (process.env.USE_MOCK_DATA === "true") {
    const index = MOCK_DOCUMENTS.findIndex((doc) => doc.id === id)
    if (index === -1) {
      return { error: new Error("Document not found") }
    }
    MOCK_DOCUMENTS.splice(index, 1)
    return { error: null }
  }

  try {
    const supabase = getSupabaseClient()
    return await supabase.from("documents").delete().eq("id", id)
  } catch (error) {
    console.error(`Error deleting document with id ${id}:`, error)
    return { error }
  }
}

// Health check function
export async function checkDatabaseConnection() {
  if (process.env.USE_MOCK_DATA === "true") {
    return { status: "ok", message: "Using mock data" }
  }

  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("documents").select("id").limit(1)

    if (error) {
      return { status: "error", message: error.message }
    }

    return { status: "ok", message: "Database connection successful" }
  } catch (error) {
    console.error("Error checking database connection:", error)
    return { status: "error", message: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Get category distribution
export async function getCategoryDistribution() {
  if (process.env.USE_MOCK_DATA === "true") {
    return { data: MOCK_CATEGORY_DISTRIBUTION, error: null }
  }

  try {
    const supabase = getSupabaseClient()
    // In a real implementation, this would be a more complex query
    // For now, we'll just return mock data
    return { data: MOCK_CATEGORY_DISTRIBUTION, error: null }
  } catch (error) {
    console.error("Error getting category distribution:", error)
    return { data: null, error }
  }
}

// Get popular searches
export async function getPopularSearches() {
  if (process.env.USE_MOCK_DATA === "true") {
    return { data: MOCK_POPULAR_SEARCHES, error: null }
  }

  try {
    const supabase = getSupabaseClient()
    // In a real implementation, this would be a more complex query
    // For now, we'll just return mock data
    return { data: MOCK_POPULAR_SEARCHES, error: null }
  } catch (error) {
    console.error("Error getting popular searches:", error)
    return { data: null, error }
  }
}
