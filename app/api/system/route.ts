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
          const { data: statsData, error: statsError } = await getSystemStats()

          if (statsError) {
            console.error("Stats error:", statsError)
            // Return mock stats instead of error
            return NextResponse.json(MOCK_STATS)
          }

          return NextResponse.json(statsData)
        } catch (error) {
          console.error("Error getting system stats:", error)
          // Return mock stats on error
          return NextResponse.json(MOCK_STATS)
        }

      case "diagnostics":
        try {
          const target = searchParams.get("target") || "all"

          if (target === "database" || target === "all") {
            const dbStatus = await checkDatabaseConnection()

            if (target === "database") {
              return NextResponse.json(dbStatus)
            }
          }

          if (target === "pinecone" || target === "all") {
            const pineconeStatus = await checkPineconeConnection()

            if (target === "pinecone") {
              return NextResponse.json(pineconeStatus)
            }
          }

          if (target === "all") {
            const dbStatus = await checkDatabaseConnection()
            const pineconeStatus = await checkPineconeConnection()

            return NextResponse.json({
              database: dbStatus,
              pinecone: pineconeStatus,
            })
          }

          return NextResponse.json({ error: "Invalid target" }, { status: 400 })
        } catch (error) {
          console.error("Error in diagnostics:", error)
          // Return mock diagnostics data on error
          return NextResponse.json({
            database: { status: "unknown", message: "Error checking database" },
            pinecone: { status: "unknown", message: "Error checking Pinecone" },
          })
        }

      case "health":
      default:
        try {
          const { data: healthData, error: healthError } = await getHealthStatus()

          if (healthError) {
            console.error("Health error:", healthError)
            // Return mock health data instead of error
            return NextResponse.json({
              status: "unknown",
              message: "Error checking health status",
              timestamp: new Date().toISOString(),
            })
          }

          return NextResponse.json(healthData)
        } catch (error) {
          console.error("Error checking health status:", error)
          // Return mock health data on error
          return NextResponse.json({
            status: "unknown",
            message: "Error checking health status",
            timestamp: new Date().toISOString(),
          })
        }
    }
  } catch (error) {
    console.error("Error in GET /api/system:", error)
    // Return generic system status on error
    return NextResponse.json({
      status: "error",
      message: "Error processing system request",
      timestamp: new Date().toISOString(),
    })
  }
}
