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
        details: {
          url: "https://example-supabase.supabase.co",
          version: "2.x.x",
          status: "connected",
          tables: ["documents", "feedback", "analytics"],
        },
        isMockData: true,
      })
    }

    // Real connection test
    const supabase = createClient()
    const { data, error } = await supabase.from("documents").select("count(*)").single()

    if (error) {
      throw error
    }

    // Get database version and other info
    const { data: versionData, error: versionError } = await supabase.rpc("get_db_info").single()

    if (versionError) {
      console.warn("Could not get database version info:", versionError)
    }

    return NextResponse.json({
      success: true,
      details: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        version: versionData?.version || "Unknown",
        status: "connected",
        tables: versionData?.tables || [],
      },
    })
  } catch (error) {
    console.error("Supabase diagnostics error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
