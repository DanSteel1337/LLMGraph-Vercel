import { createServerClient } from "@/lib/supabase/server"
import { checkPineconeConnection as checkPineconeConnectionUtil } from "@/lib/pinecone/client"
import { shouldUseMockData } from "@/lib/environment"
import { MOCK_STATS } from "@/lib/mock-data"

// Check database connection
export async function checkDatabaseConnection() {
  try {
    // Use mock data in development or preview
    if (shouldUseMockData()) {
      console.log("[MOCK] Using mock database connection status")
      return {
        connected: true,
        message: "Connected (Mock)",
        isMockData: true,
      }
    }

    const supabase = createServerClient()
    const { data, error } = await supabase.from("documents").select("id").limit(1)

    if (error) {
      console.error("Database connection error:", error)
      return {
        connected: false,
        message: error.message,
        error,
      }
    }

    return {
      connected: true,
      message: "Connected successfully",
    }
  } catch (error) {
    console.error("Error checking database connection:", error)
    return {
      connected: false,
      message: error instanceof Error ? error.message : "Unknown error",
      error,
    }
  }
}

// Check Pinecone connection
export async function checkPineconeConnection() {
  try {
    // Use mock data in development or preview
    if (shouldUseMockData()) {
      console.log("[MOCK] Using mock Pinecone connection status")
      return {
        connected: true,
        message: "Connected (Mock)",
        isMockData: true,
      }
    }

    const result = await checkPineconeConnectionUtil()

    return {
      connected: result.success,
      message: result.message,
      stats: result.stats,
    }
  } catch (error) {
    console.error("Error checking Pinecone connection:", error)
    return {
      connected: false,
      message: error instanceof Error ? error.message : "Unknown error",
      error,
    }
  }
}

// Get system stats
export async function getSystemStats() {
  try {
    // Use mock data in development or preview
    if (shouldUseMockData()) {
      console.log("[MOCK] Using mock system stats")
      return {
        data: {
          ...MOCK_STATS,
          isMockData: true,
          services: {
            database: { status: "ok", message: "Connected (Mock)" },
            pinecone: { status: "ok", message: "Operational (Mock)" },
          },
        },
      }
    }

    const supabase = createServerClient()

    // Get document count
    const { count: documentCount, error: docError } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })

    if (docError) {
      console.error("Error fetching document count:", docError)
      return {
        error: docError,
      }
    }

    // Get search count
    const { count: searchCount, error: searchError } = await supabase
      .from("searches")
      .select("*", { count: "exact", head: true })

    if (searchError) {
      console.error("Error fetching search count:", searchError)
      return {
        error: searchError,
      }
    }

    // Get feedback count
    const { count: feedbackCount, error: feedbackError } = await supabase
      .from("feedback")
      .select("*", { count: "exact", head: true })

    if (feedbackError) {
      console.error("Error fetching feedback count:", feedbackError)
      return {
        error: feedbackError,
      }
    }

    // Get user count
    const { count: userCount, error: userError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    if (userError) {
      console.error("Error fetching user count:", userError)
      return {
        error: userError,
      }
    }

    // Check Pinecone connection
    const pineconeStatus = await checkPineconeConnection()

    return {
      data: {
        documentCount: documentCount || 0,
        searchCount: searchCount || 0,
        feedbackCount: feedbackCount || 0,
        userCount: userCount || 0,
        pineconeStatus: pineconeStatus.connected ? "connected" : "disconnected",
        services: {
          database: { status: "ok", message: "Connected" },
          pinecone: {
            status: pineconeStatus.connected ? "ok" : "error",
            message: pineconeStatus.message || (pineconeStatus.connected ? "Operational" : "Connection failed"),
          },
        },
      },
    }
  } catch (error) {
    console.error("Error getting system stats:", error)
    return {
      error,
      data: {
        ...MOCK_STATS,
        isMockData: true,
        services: {
          database: { status: "error", message: "Error fetching stats" },
          pinecone: { status: "warning", message: "Status unknown" },
        },
      },
    }
  }
}

// Get system status
export async function getSystemStatus() {
  try {
    // Use mock data in development or preview
    if (shouldUseMockData()) {
      console.log("[MOCK] Using mock system status")
      return {
        status: "ok",
        stats: {
          ...MOCK_STATS,
          isMockData: true,
          services: {
            database: { status: "ok", message: "Connected (Mock)" },
            pinecone: { status: "ok", message: "Operational (Mock)" },
          },
        },
      }
    }

    // Check database connection
    const dbStatus = await checkDatabaseConnection()

    // Check Pinecone connection
    const pineconeStatus = await checkPineconeConnection()

    // Get system stats
    const { data: stats, error: statsError } = await getSystemStats()

    if (statsError) {
      console.error("Error getting system stats:", statsError)
      return {
        status: "error",
        error: statsError,
        stats: {
          ...MOCK_STATS,
          isMockData: true,
          services: {
            database: { status: dbStatus.connected ? "ok" : "error", message: dbStatus.message },
            pinecone: { status: pineconeStatus.connected ? "ok" : "error", message: pineconeStatus.message },
          },
        },
      }
    }

    // Determine overall status
    const status = dbStatus.connected && pineconeStatus.connected ? "ok" : "error"

    return {
      status,
      stats: {
        ...stats,
        services: {
          database: { status: dbStatus.connected ? "ok" : "error", message: dbStatus.message },
          pinecone: { status: pineconeStatus.connected ? "ok" : "error", message: pineconeStatus.message },
        },
      },
    }
  } catch (error) {
    console.error("Error getting system status:", error)
    return {
      status: "error",
      error,
      stats: {
        ...MOCK_STATS,
        isMockData: true,
        services: {
          database: { status: "error", message: "Error checking database" },
          pinecone: { status: "error", message: "Error checking Pinecone" },
        },
      },
    }
  }
}
