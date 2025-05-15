import { NextResponse } from "next/server"
import { getPineconeStats } from "@/lib/ai-sdk"
import { createClient } from "@supabase/supabase-js"

// Use Node.js runtime for Pinecone
export const runtime = "nodejs"

// Create a fresh Supabase client for each request
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Get document count
async function getDocumentCount(): Promise<number> {
  try {
    const supabase = getSupabaseClient()
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

// Get search count
async function getSearchCount(): Promise<number> {
  try {
    const supabase = getSupabaseClient()
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

// Get feedback count
async function getFeedbackCount(): Promise<number> {
  try {
    const supabase = getSupabaseClient()
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

export async function GET() {
  try {
    // Get stats from database first (more likely to succeed)
    let totalDocuments = 0
    let totalSearches = 0
    let totalFeedback = 0

    try {
      totalDocuments = await getDocumentCount()
    } catch (dbError) {
      console.error("Error fetching document count:", dbError)
    }

    try {
      totalSearches = await getSearchCount()
    } catch (dbError) {
      console.error("Error fetching search count:", dbError)
    }

    try {
      totalFeedback = await getFeedbackCount()
    } catch (dbError) {
      console.error("Error fetching feedback count:", dbError)
    }

    // Get stats from Pinecone (might fail if Pinecone is unavailable)
    let pineconeStats = { vectorCount: 0, dimensions: 0, indexName: "unknown" }
    try {
      pineconeStats = await getPineconeStats()
    } catch (pineconeError) {
      console.error("Error fetching Pinecone stats:", pineconeError)
      // Continue with default values
    }

    // Return all stats
    return NextResponse.json({
      totalDocuments,
      totalSearches,
      totalFeedback,
      vectorCount: pineconeStats.vectorCount,
      dimensions: pineconeStats.dimensions,
      indexName: pineconeStats.indexName,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)

    // Return a more detailed error response
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        message: error instanceof Error ? error.message : String(error),
        totalDocuments: 0,
        totalSearches: 0,
        totalFeedback: 0,
        vectorCount: 0,
        dimensions: 0,
        indexName: "unknown",
      },
      { status: 200 }, // Return 200 even for errors to avoid cascading failures
    )
  }
}
