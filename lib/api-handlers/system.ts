/**
 * System API Handlers
 * Centralizes all system-related API functionality (health, diagnostics, stats)
 */
import { createClient } from "@supabase/supabase-js"
import { getPineconeStats } from "@/lib/pinecone/client"

// Create a Supabase client for API handlers
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Check database connection
export async function checkDatabaseConnection() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("documents").select("id").limit(1)

    if (error) {
      console.error("Database connection error:", error)
      return { status: "error", message: error.message }
    }

    return { status: "ok", message: "Database connection successful" }
  } catch (error) {
    console.error("Error checking database connection:", error)
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Check Pinecone connection
export async function checkPineconeConnection() {
  try {
    const stats = await getPineconeStats()

    return {
      status: "ok",
      message: "Pinecone connection successful",
      stats,
    }
  } catch (error) {
    console.error("Error checking Pinecone connection:", error)
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get system stats
export async function getSystemStats() {
  try {
    // Get stats from database
    let totalDocuments = 0
    let totalSearches = 0
    let totalFeedback = 0

    const supabase = getSupabaseClient()

    try {
      const { count } = await supabase.from("documents").select("*", { count: "exact", head: true })
      totalDocuments = count || 0
    } catch (dbError) {
      console.error("Error fetching document count:", dbError)
    }

    try {
      const { count } = await supabase.from("search_history").select("*", { count: "exact", head: true })
      totalSearches = count || 0
    } catch (dbError) {
      console.error("Error fetching search count:", dbError)
    }

    try {
      const { count } = await supabase.from("feedback").select("*", { count: "exact", head: true })
      totalFeedback = count || 0
    } catch (dbError) {
      console.error("Error fetching feedback count:", dbError)
    }

    // Get stats from Pinecone
    let pineconeStats = { vectorCount: 0, dimensions: 0, indexName: "unknown" }
    try {
      pineconeStats = await getPineconeStats()
    } catch (pineconeError) {
      console.error("Error fetching Pinecone stats:", pineconeError)
    }

    // Return all stats
    return {
      data: {
        totalDocuments,
        totalSearches,
        totalFeedback,
        vectorCount: pineconeStats.vectorCount,
        dimensions: pineconeStats.dimensions,
        indexName: pineconeStats.indexName,
      },
    }
  } catch (error) {
    console.error("Error fetching system stats:", error)
    return { error }
  }
}

// Get health status
export async function getHealthStatus() {
  try {
    const dbStatus = await checkDatabaseConnection()
    const pineconeStatus = await checkPineconeConnection()

    return {
      data: {
        status: dbStatus.status === "ok" && pineconeStatus.status === "ok" ? "ok" : "error",
        timestamp: new Date().toISOString(),
        services: {
          database: dbStatus,
          pinecone: pineconeStatus,
        },
      },
    }
  } catch (error) {
    console.error("Error checking health status:", error)
    return { error }
  }
}
