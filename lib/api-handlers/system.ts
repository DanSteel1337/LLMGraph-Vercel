import { createClient } from "@/lib/supabase/server"
import { createClient as createPineconeClient } from "@/lib/pinecone/client"

// Type for system stats response
interface SystemStats {
  totalDocuments: number
  totalSearches: number
  totalUsers: number
  uptime: string
  cpuUsage: string
  memoryUsage: string
  lastUpdated: string
}

// Type for health status response
interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  services: {
    database: {
      status: "up" | "down" | "degraded"
      latency: number
    }
    search: {
      status: "up" | "down" | "degraded"
      latency: number
    }
    storage: {
      status: "up" | "down" | "degraded"
      latency: number
    }
  }
  message?: string
}

// Type for database connection check response
interface DatabaseConnectionStatus {
  connected: boolean
  latency: number
  message: string
  timestamp: string
}

// Type for Pinecone connection check response
interface PineconeConnectionStatus {
  connected: boolean
  latency: number
  message: string
  timestamp: string
  indexes?: string[]
}

// Type for API response
interface ApiResponse<T> {
  data: T
  error?: Error
}

/**
 * Get system statistics
 * @returns System statistics
 */
export async function getSystemStats(): Promise<ApiResponse<SystemStats>> {
  try {
    const supabase = createClient()
    const startTime = Date.now()

    // Get document count
    const { count: documentCount, error: documentError } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })

    if (documentError) {
      throw new Error(`Failed to get document count: ${documentError.message}`)
    }

    // Get search count
    const { count: searchCount, error: searchError } = await supabase
      .from("searches")
      .select("*", { count: "exact", head: true })

    if (searchError) {
      throw new Error(`Failed to get search count: ${searchError.message}`)
    }

    // Get user count
    const { count: userCount, error: userError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    if (userError) {
      throw new Error(`Failed to get user count: ${userError.message}`)
    }

    // Calculate mock system metrics
    const uptime = "5d 12h 30m" // Mock uptime
    const cpuUsage = "32%" // Mock CPU usage
    const memoryUsage = "45%" // Mock memory usage

    return {
      data: {
        totalDocuments: documentCount || 0,
        totalSearches: searchCount || 0,
        totalUsers: userCount || 0,
        uptime,
        cpuUsage,
        memoryUsage,
        lastUpdated: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("Error getting system stats:", error)
    return {
      data: {
        totalDocuments: 125, // Mock data
        totalSearches: 1250,
        totalUsers: 45,
        uptime: "5d 12h 30m",
        cpuUsage: "32%",
        memoryUsage: "45%",
        lastUpdated: new Date().toISOString(),
      },
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

/**
 * Check database connection
 * @returns Database connection status
 */
export async function checkDatabaseConnection(): Promise<DatabaseConnectionStatus> {
  try {
    const startTime = Date.now()
    const supabase = createClient()

    // Simple query to check connection
    const { data, error } = await supabase.from("documents").select("count(*)", { count: "exact" }).limit(1)

    const endTime = Date.now()
    const latency = endTime - startTime

    if (error) {
      return {
        connected: false,
        latency,
        message: `Database connection failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      }
    }

    return {
      connected: true,
      latency,
      message: "Database connection successful",
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      connected: false,
      latency: 0,
      message: `Database connection failed: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Check Pinecone connection
 * @returns Pinecone connection status
 */
export async function checkPineconeConnection(): Promise<PineconeConnectionStatus> {
  try {
    const startTime = Date.now()
    const pinecone = createPineconeClient()

    // Check if Pinecone client is available
    if (!pinecone) {
      return {
        connected: false,
        latency: 0,
        message: "Pinecone client not available",
        timestamp: new Date().toISOString(),
      }
    }

    // List indexes to check connection
    const indexes = await pinecone.listIndexes()

    const endTime = Date.now()
    const latency = endTime - startTime

    return {
      connected: true,
      latency,
      message: "Pinecone connection successful",
      timestamp: new Date().toISOString(),
      indexes: indexes.map((index) => index.name),
    }
  } catch (error) {
    return {
      connected: false,
      latency: 0,
      message: `Pinecone connection failed: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Get overall system health status
 * @returns Health status
 */
export async function getHealthStatus(): Promise<ApiResponse<HealthStatus>> {
  try {
    // Check database connection
    const dbStatus = await checkDatabaseConnection()

    // Check Pinecone connection
    const pineconeStatus = await checkPineconeConnection()

    // Determine overall status
    let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy"
    let message = "All systems operational"

    if (!dbStatus.connected && !pineconeStatus.connected) {
      overallStatus = "unhealthy"
      message = "Multiple critical services are down"
    } else if (!dbStatus.connected || !pineconeStatus.connected) {
      overallStatus = "degraded"
      message = "Some services are experiencing issues"
    }

    return {
      data: {
        status: overallStatus,
        services: {
          database: {
            status: dbStatus.connected ? "up" : "down",
            latency: dbStatus.latency,
          },
          search: {
            status: pineconeStatus.connected ? "up" : "down",
            latency: pineconeStatus.latency,
          },
          storage: {
            status: dbStatus.connected ? "up" : "down", // Using DB status as proxy for storage
            latency: dbStatus.latency,
          },
        },
        message,
      },
    }
  } catch (error) {
    console.error("Error getting health status:", error)
    return {
      data: {
        status: "degraded",
        services: {
          database: {
            status: "degraded",
            latency: 0,
          },
          search: {
            status: "degraded",
            latency: 0,
          },
          storage: {
            status: "degraded",
            latency: 0,
          },
        },
        message: "Error checking health status",
      },
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}
