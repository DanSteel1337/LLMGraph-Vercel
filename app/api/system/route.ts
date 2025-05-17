import { type NextRequest, NextResponse } from "next/server"
import {
  checkDatabaseConnection,
  checkPineconeConnection,
  getSystemStats,
  getHealthStatus,
} from "@/lib/api-handlers/system"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

// Main system endpoint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "health"

    // Handle different system-related requests
    switch (type) {
      case "stats":
        const { data: statsData, error: statsError } = await getSystemStats()

        if (statsError) {
          console.error("Stats error:", statsError)
          return NextResponse.json({ error: statsError.message }, { status: 500 })
        }

        return NextResponse.json(statsData)

      case "diagnostics":
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

      case "health":
      default:
        const { data: healthData, error: healthError } = await getHealthStatus()

        if (healthError) {
          console.error("Health error:", healthError)
          return NextResponse.json({ error: healthError.message }, { status: 500 })
        }

        return NextResponse.json(healthData)
    }
  } catch (error) {
    console.error("Error in GET /api/system:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
