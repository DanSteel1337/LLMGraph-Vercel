import { NextResponse } from "next/server"
import { MOCK_SEARCH_TRENDS } from "@/lib/mock-data"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

export async function GET() {
  try {
    // In a real implementation, we would fetch data from the database
    // For now, we'll return mock data
    return NextResponse.json({ trends: MOCK_SEARCH_TRENDS })
  } catch (error) {
    console.error("Error in search trends API:", error)
    // Always return JSON, even on error
    return NextResponse.json({
      trends: MOCK_SEARCH_TRENDS,
      error: "An error occurred while fetching search trends",
    })
  }
}
