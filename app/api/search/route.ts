import { NextResponse } from "next/server"
import { performSearch, getPopularSearches, getSearchTrends } from "@/lib/api-handlers/search"
import { MOCK_POPULAR_SEARCHES, MOCK_SEARCH_TRENDS, MOCK_SEARCH_RESULTS } from "@/lib/mock-data"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const type = url.searchParams.get("type")

    // Handle popular searches
    if (type === "popular") {
      const { data, error } = await getPopularSearches()

      if (error) {
        console.error("Error fetching popular searches:", error)
        return NextResponse.json({
          popularSearches: MOCK_POPULAR_SEARCHES,
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        })
      }

      return NextResponse.json({
        popularSearches: data || MOCK_POPULAR_SEARCHES,
        status: "success",
      })
    }

    // Handle trends
    if (type === "trends") {
      const { data, error } = await getSearchTrends()

      if (error) {
        console.error("Error fetching search trends:", error)
        return NextResponse.json({
          trends: MOCK_SEARCH_TRENDS,
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        })
      }

      return NextResponse.json({
        trends: data || MOCK_SEARCH_TRENDS,
        status: "success",
      })
    }

    // Default response for other GET requests
    return NextResponse.json({
      message: "Use POST for search queries or specify type parameter",
      status: "info",
    })
  } catch (error) {
    console.error("Error in search API GET:", error)
    // Return appropriate mock data based on the requested type
    const url = new URL(req.url)
    const type = url.searchParams.get("type")

    if (type === "popular") {
      return NextResponse.json({
        popularSearches: MOCK_POPULAR_SEARCHES,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    } else if (type === "trends") {
      return NextResponse.json({
        trends: MOCK_SEARCH_TRENDS,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    }

    return NextResponse.json({
      message: "Error processing search request",
      error: error instanceof Error ? error.message : "Unknown error",
      status: "error",
    })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { query, filters = {} } = body

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

    const { results, error } = await performSearch(query, filters)

    if (error) {
      console.error("Error performing search:", error)
      return NextResponse.json({
        results: MOCK_SEARCH_RESULTS,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    }

    return NextResponse.json({
      results: results || MOCK_SEARCH_RESULTS,
      status: "success",
    })
  } catch (error) {
    console.error("Error in search API POST:", error)
    // Return mock search results on error
    return NextResponse.json({
      results: MOCK_SEARCH_RESULTS,
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
