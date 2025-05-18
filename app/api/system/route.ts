import { type NextRequest, NextResponse } from "next/server"
import {
  checkDatabaseConnection,
  checkPineconeConnection,
  getSystemStats,
  getSystemStatus,
} from "@/lib/api-handlers/system"
import { MOCK_STATS } from "@/lib"
import { shouldUseMockData } from "@/lib"

export const runtime = "edge" // Use Edge runtime for better performance

// Main system endpoint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "health"

    // Use mock data in preview environments
    if (shouldUseMockData()) {
      return NextResponse.json({
        status: "healthy",
        stats: MOCK_STATS,
        isMockData: true,
        timestamp: new Date().toISOString(),
        services: {
          database: { status: "ok", message: "Connected (Mock)" },
          pinecone: { status: "ok", message: "Operational (Mock)" },
        },
      })
    }

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
              isMockData: true,
              services: {
                database: { status: "error", message: "Error fetching stats" },
                pinecone: { status: "warning", message: "Status unknown" },
              },
            })
          }

          return NextResponse.json({
            ...data,
            status: "success",
            services: data.services || {
              database: { status: "ok", message: "Connected" },
              pinecone: { status: "ok", message: "Operational" },
            },
          })
        } catch (error) {
          console.error("Error getting system stats:", error)
          // Return mock stats on error
          return NextResponse.json({
            ...MOCK_STATS,
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
            isMockData: true,
            services: {
              database: { status: "error", message: "Error fetching stats" },
              pinecone: { status: "warning", message: "Status unknown" },
            },
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
                services: {
                  database: {
                    status: dbStatus.connected ? "ok" : "error",
                    message: dbStatus.message || (dbStatus.connected ? "Connected" : "Connection failed"),
                  },
                },
              })
            }
          }

          if (target === "pinecone" || target === "all") {
            const pineconeStatus = await checkPineconeConnection()

            if (target === "pinecone") {
              return NextResponse.json({
                ...pineconeStatus,
                status: pineconeStatus.connected ? "success" : "error",
                services: {
                  pinecone: {
                    status: pineconeStatus.connected ? "ok" : "error",
                    message: pineconeStatus.message || (pineconeStatus.connected ? "Operational" : "Connection failed"),
                  },
                },
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
              services: {
                database: {
                  status: dbStatus.connected ? "ok" : "error",
                  message: dbStatus.message || (dbStatus.connected ? "Connected" : "Connection failed"),
                },
                pinecone: {
                  status: pineconeStatus.connected ? "ok" : "error",
                  message: pineconeStatus.message || (pineconeStatus.connected ? "Operational" : "Connection failed"),
                },
              },
            })
          }

          return NextResponse.json(
            {
              error: "Invalid target",
              status: "error",
              services: {},
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
            isMockData: true,
            services: {
              database: { status: "error", message: "Error checking database" },
              pinecone: { status: "error", message: "Error checking Pinecone" },
            },
          })
        }

      case "health":
      default:
        try {
          const { status, stats, error } = await getSystemStatus()

          if (error) {
            console.error("Error fetching system status:", error)
            return NextResponse.json(
              {
                error: "Failed to fetch system status",
                details: error.message,
                status: "error",
                services: {
                  database: { status: "warning", message: "Status unknown" },
                  pinecone: { status: "warning", message: "Status unknown" },
                },
                timestamp: new Date().toISOString(),
              },
              { status: 500 },
            )
          }

          return NextResponse.json({
            status,
            stats,
            timestamp: new Date().toISOString(),
            services: stats?.services || {
              database: { status: "ok", message: "Connected" },
              pinecone: { status: "ok", message: "Operational" },
            },
          })
        } catch (error) {
          console.error("Unexpected error in system status route:", error)
          return NextResponse.json(
            {
              error: "An unexpected error occurred",
              details: error instanceof Error ? error.message : String(error),
              status: "error",
              services: {
                database: { status: "warning", message: "Status unknown" },
                pinecone: { status: "warning", message: "Status unknown" },
              },
              timestamp: new Date().toISOString(),
            },
            { status: 500 },
          )
        }
    }
  } catch (error) {
    console.error("Error in GET /api/system:", error)
    // Return generic system status on error
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      isMockData: true,
      services: {
        database: { status: "error", message: "Error checking database" },
        pinecone: { status: "error", message: "Error checking Pinecone" },
      },
    })
  }
}
