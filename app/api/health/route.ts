import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/db"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

export async function GET() {
  try {
    const dbStatus = await checkDatabaseConnection()

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
      },
    })
  } catch (error) {
    console.error("Error in GET /api/health:", error)
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
