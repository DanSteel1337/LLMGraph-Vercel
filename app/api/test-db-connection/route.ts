import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { shouldUseMockData } from "@/lib/environment"

export const runtime = "edge"

export async function GET() {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      return NextResponse.json({
        success: true,
        message: "Database connection successful (mock)",
        connectionTest: {
          success: true,
          message: "Mock connection successful",
        },
        environmentVariables: {
          supabaseUrl: "✓ Configured (mock)",
          supabaseKey: "✓ Configured (mock)",
        },
        tablesTest: {
          documents: { exists: true },
          feedback: { exists: true },
          search_analytics: { exists: true },
        },
        status: "success",
        isMockData: true,
      })
    }

    const supabase = createClient()

    // Simple query to test connection
    const { data, error } = await supabase.from("documents").select("count(*)").single()

    if (error) {
      console.error("Database connection test failed:", error)
      return NextResponse.json({
        success: false,
        message: "Database connection failed",
        error: error.message,
        status: "error",
      })
    }

    // Check environment variables
    const environmentVariables = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Configured" : "✗ Missing",
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Configured" : "✗ Missing",
    }

    // Check if tables exist
    const tables = ["documents", "feedback", "search_analytics"]
    const tablesTest: Record<string, { exists: boolean; error?: string }> = {}

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("count(*)").limit(1)

        tablesTest[table] = {
          exists: !error,
          ...(error && { error: error.message }),
        }
      } catch (err) {
        tablesTest[table] = {
          exists: false,
          error: err instanceof Error ? err.message : "Unknown error",
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data,
      connectionTest: {
        success: true,
        message: "Connection successful",
      },
      environmentVariables,
      tablesTest,
      status: "success",
    })
  } catch (error) {
    console.error("Error testing database connection:", error)
    // Always return JSON, even on error
    return NextResponse.json({
      success: false,
      message: "Database connection test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      status: "error",
    })
  }
}
