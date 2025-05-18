import { type NextRequest, NextResponse } from "next/server"
import {
  checkDatabaseConnection,
  checkPineconeConnection,
  getSystemStats,
  getHealthStatus,
} from "@/lib/api-handlers/system"
import { MOCK_STATS } from "@/lib/mock-data"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

// Main system endpoint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "health"

    // Handle different system-related requests
    switch (type) {
      case "stats":
        try {
          const { data, error } = await getSystemStats()

          if (error) {
            console.error("Stats error:", error)
            // Return mock stats instead of error
            return NextResponse.json({
              ...MOCK_STATS,
              status: "error",
              message: error instanceof Error ? error.message : "Unknown error",
            })
          }

          return NextResponse.json({
            ...data,
            status: "success",
          })
        } catch (error) {
          console.error("Error getting system stats:", error)
          // Return mock stats on error
          return NextResponse.json({
            ...MOCK_STATS,
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          })
        }

      case "diagnostics":
        try {
          const target = searchParams.get("target") || "all"

          if (target === "database" || target === "all") {
            const dbStatus = await checkDatabaseConnection()

            if (target === "database") {
              return NextResponse.json({
                ...dbStatus,
                status: dbStatus.connected ? "success" : "error",
              })
            }
          }

          if (target === "pinecone" || target === "all") {
            const pineconeStatus = await checkPineconeConnection()

            if (target === "pinecone") {
              return NextResponse.json({
                ...pineconeStatus,
                status: pineconeStatus.connected ? "success" : "error",
              })
            }
          }

          if (target === "all") {
            const dbStatus = await checkDatabaseConnection()
            const pineconeStatus = await checkPineconeConnection()

            return NextResponse.json({
              database: {
                ...dbStatus,
                status: dbStatus.connected ? "success" : "error",
              },
              pinecone: {
                ...pineconeStatus,
                status: pineconeStatus.connected ? "success" : "error",
              },
              status: dbStatus.connected && pineconeStatus.connected ? "success" : "error",
            })
          }

          return NextResponse.json(
            {
              error: "Invalid target",
              status: "error",
            },
            { status: 400 },
          )
        } catch (error) {
          console.error("Error in diagnostics:", error)
          // Return mock diagnostics data on error
          return NextResponse.json({
            database: { status: "error", message: "Error checking database" },
            pinecone: { status: "error", message: "Error checking Pinecone" },
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          })
        }

      case "health":
      default:
        try {
          const { data, error } = await getHealthStatus()

          if (error) {
            console.error("Health error:", error)
            // Return mock health data instead of error
            return NextResponse.json({
              status: "error",
              message: error instanceof Error ? error.message : "Unknown error",
              timestamp: new Date().toISOString(),
            })
          }

          return NextResponse.json({
            ...data,
            status: data.status === "healthy" ? "success" : "error",
          })
        } catch (error) {
          console.error("Error checking health status:", error)
          // Return mock health data on error
          return NextResponse.json({
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
          })
        }
    }
  } catch (error) {
    console.error("Error in GET /api/system:", error)
    // Return generic system status on error
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })
  }
}
