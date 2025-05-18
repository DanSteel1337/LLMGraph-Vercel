import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { shouldUseMockData } from "@/lib/environment"

export const runtime = "edge"

export async function POST(request: Request) {
  try {
    const { query, searchType } = await request.json()

    // Check if we should use mock data
    if (shouldUseMockData()) {
      // Just return success without actually tracking
      return NextResponse.json({
        success: true,
        message: "Search tracked (mock)",
        isMockData: true,
      })
    }

    // Track the search in the database
    const supabase = createClient()

    const { error } = await supabase.from("search_analytics").insert({
      query,
      search_type: searchType,
      timestamp: new Date().toISOString(),
    })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "Search tracked successfully",
    })
  } catch (error) {
    console.error("Error tracking search:", error)
    return NextResponse.json({ error: "Failed to track search" }, { status: 500 })
  }
}
