import { NextResponse } from "next/server"
import { performHybridSearch } from "@/lib/search"
import { MOCK_POPULAR_SEARCHES, MOCK_SEARCH_TRENDS } from "@/lib/mock-data"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const type = url.searchParams.get("type")

    // Handle popular searches
    if (type === "popular") {
      // Return mock data for popular searches
      return NextResponse.json({
        popularSearches: MOCK_POPULAR_SEARCHES,
      })
    }

    // Handle trends
    if (type === "trends") {
      // Return mock data for search trends
      return NextResponse.json({
        trends: MOCK_SEARCH_TRENDS,
      })
    }

    // Default response for other GET requests
    return NextResponse.json({
      message: "Use POST for search queries or specify type parameter",
    })
  } catch (error) {
    console.error("Error in search API GET:", error)
    // Return appropriate mock data based on the requested type
    const url = new URL(req.url)
    const type = url.searchParams.get("type")

    if (type === "popular") {
      return NextResponse.json({ popularSearches: MOCK_POPULAR_SEARCHES })
    } else if (type === "trends") {
      return NextResponse.json({ trends: MOCK_SEARCH_TRENDS })
    }

    return NextResponse.json({
      message: "Error processing search request",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { query, filters = {} } = body

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const results = await performHybridSearch(query, filters)
    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error in search API POST:", error)
    // Return mock search results on error
    return NextResponse.json({
      results: [],
      error: "An error occurred while performing search",
    })
  }
}
