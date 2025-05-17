import { type NextRequest, NextResponse } from "next/server"
import { searchDocuments, trackSearch, getSearchTrends, getPopularSearches } from "@/lib/api-handlers/search"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

// Main search endpoint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "search"

    // Handle different search-related requests
    switch (type) {
      case "trends":
        const days = Number.parseInt(searchParams.get("days") || "7", 10)
        const { data: trendsData, error: trendsError } = await getSearchTrends(days)

        if (trendsError) {
          return NextResponse.json({ error: trendsError.message }, { status: 500 })
        }

        return NextResponse.json({ trends: trendsData })

      case "popular":
        const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
        const { data: popularData, error: popularError } = await getPopularSearches(limit)

        if (popularError) {
          return NextResponse.json({ error: popularError.message }, { status: 500 })
        }

        return NextResponse.json({ popular: popularData })

      case "search":
      default:
        if (!query) {
          return NextResponse.json({ error: "Query parameter q is required" }, { status: 400 })
        }

        // Get filters from query params
        const filters: Record<string, any> = {}
        if (searchParams.has("category")) {
          filters.category = searchParams.get("category")
        }
        if (searchParams.has("version")) {
          filters.version = searchParams.get("version")
        }

        // Perform search
        const { data, error } = await searchDocuments(query, Object.keys(filters).length > 0 ? filters : undefined)

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Track search asynchronously (don't wait for result)
        trackSearch(query).catch((err) => console.error("Error tracking search:", err))

        return NextResponse.json({ results: data })
    }
  } catch (error) {
    console.error("Error in GET /api/search:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

// Track a search (for analytics)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, userId } = body

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const { error, success } = await trackSearch(query, userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success })
  } catch (error) {
    console.error("Error in POST /api/search:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
