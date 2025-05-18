import { type NextRequest, NextResponse } from "next/server"
import { performSearch } from "@/lib/api-handlers/search"
import { MOCK_SEARCH_RESULTS } from "@/lib/mock-data"
import { shouldUseMockData } from "@/lib/environment"

export const runtime = "edge" // Use Edge runtime for better performance

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const query = searchParams.get("q") || ""
  const type = searchParams.get("type") || "hybrid"

  // Return mock data in preview environments
  if (shouldUseMockData()) {
    return NextResponse.json({
      results: MOCK_SEARCH_RESULTS,
      isMockData: true,
      searchType: type,
    })
  }

  try {
    if (!query) {
      return NextResponse.json({ results: [] })
    }

    // Perform search based on type
    const { results, error } = await performSearch(query, { type })

    if (error) {
      console.error("Search error:", error)
      return NextResponse.json({ error: "Failed to perform search", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ results, searchType: type })
  } catch (error) {
    console.error("Unexpected error in search route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, filters = {} } = body

    // Check if we should use mock data
    const useMockData = shouldUseMockData()

    if (!query) {
      return NextResponse.json(
        {
          error: "Query is required",
          status: "error",
          results: [],
        },
        { status: 400 },
      )
    }

    // If we should use mock data, return mock search results immediately
    if (useMockData) {
      return NextResponse.json({
        results: MOCK_SEARCH_RESULTS,
        status: "success",
        isMockData: true,
      })
    }

    const { results, error } = await performSearch(query, filters)

    if (error) {
      console.error("Error performing search:", error)
      return NextResponse.json({
        results: MOCK_SEARCH_RESULTS,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        isMockData: true,
      })
    }

    // Ensure we always return an array
    const searchResults = Array.isArray(results) ? results : results ? [results] : MOCK_SEARCH_RESULTS

    return NextResponse.json({
      results: searchResults,
      status: "success",
    })
  } catch (error) {
    console.error("Error in search API POST:", error)
    // Return mock search results on error
    return NextResponse.json({
      results: MOCK_SEARCH_RESULTS,
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      isMockData: true,
    })
  }
}
