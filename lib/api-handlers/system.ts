import { getSupabaseClient } from "@/lib/supabase/client"
import { getDetailedIndexStats } from "@/lib/pinecone/client"
import { logError } from "@/lib/error-handler"

// Scoped API endpoints and constants
const API_ENDPOINTS = {
  HEALTH: "/api/system/health",
  METRICS: "/api/system/metrics",
  STATUS: "/api/system/status",
}

const HEALTH_CHECK_INTERVAL = 60000 // 1 minute

/**
 * Gets the system health status
 * @returns System health status
 */
export async function getSystemHealth() {
  try {
    // Check database connection
    const supabase = getSupabaseClient()
    const dbStatus = await checkDatabaseConnection(supabase)

    // Check Pinecone connection
    const pineconeStatus = await checkPineconeConnection()

    return {
      status: dbStatus.status === "ok" && pineconeStatus.status === "ok" ? "ok" : "error",
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        pinecone: pineconeStatus,
      },
    }
  } catch (error) {
    logError(error, "system_health_check_error")
    return {
      status: "error",
      timestamp: new Date().toISOString(),
      services: {
        database: { status: "error", message: "Failed to check database status" },
        pinecone: { status: "error", message: "Failed to check Pinecone status" },
      },
    }
  }
}

/**
 * Checks the database status
 * @param supabase Supabase client
 * @returns Database status
 */
export async function checkDatabaseConnection(supabase: any) {
  try {
    // Simple query to check if database is responsive
    const { error } = await supabase.from("system_status").select("id").limit(1)

    if (error) {
      return { status: "error", message: error.message }
    }

    return { status: "ok", message: "Connected" }
  } catch (error) {
    logError(error, "database_status_check_error")
    return { status: "error", message: "Failed to connect to database" }
  }
}

/**
 * Checks the Pinecone status
 * @returns Pinecone status
 */
export async function checkPineconeConnection() {
  try {
    // Get Pinecone stats
    const stats = await getDetailedIndexStats()

    if (!stats) {
      return { status: "error", message: "Failed to get Pinecone stats" }
    }

    return { status: "ok", message: "Operational" }
  } catch (error) {
    logError(error, "pinecone_status_check_error")
    return { status: "error", message: "Failed to connect to Pinecone" }
  }
}

/**
 * Gets system metrics
 * @returns System metrics
 */
export async function getSystemMetrics() {
  try {
    const supabase = getSupabaseClient()

    // Get document count
    const { count: documentCount, error: documentError } = await supabase
      .from("documents")
      .select("id", { count: "exact" })

    // Get user count
    const { count: userCount, error: userError } = await supabase.from("users").select("id", { count: "exact" })

    // Get search count
    const { count: searchCount, error: searchError } = await supabase
      .from("search_history")
      .select("id", { count: "exact" })

    if (documentError || userError || searchError) {
      throw new Error("Failed to get system metrics")
    }

    return {
      documentCount: documentCount || 0,
      userCount: userCount || 0,
      searchCount: searchCount || 0,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    logError(error, "system_metrics_error")
    return {
      documentCount: 0,
      userCount: 0,
      searchCount: 0,
      timestamp: new Date().toISOString(),
      error: "Failed to get system metrics",
    }
  }
}

/**
 * Gets the health status of the system
 * @returns Health status object
 */
export async function getHealthStatus() {
  return getSystemHealth()
}

/**
 * Gets system statistics
 * @returns System statistics
 */
export async function getSystemStats() {
  try {
    const metrics = await getSystemMetrics()
    const health = await getSystemHealth()

    return {
      metrics,
      health,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    logError(error, "system_stats_error")
    return {
      error: "Failed to get system stats",
      timestamp: new Date().toISOString(),
    }
  }
}
