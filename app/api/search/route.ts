import { NextResponse } from "next/server"
import { performHybridSearch } from "@/lib/search"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const type = url.searchParams.get("type")

    // Handle popular searches
    if (type === "popular") {
      // Mock data for popular searches
      return NextResponse.json({
        popularSearches: [
          { query: "vector database", count: 120 },
          { query: "embeddings", count: 95 },
          { query: "semantic search", count: 87 },
          { query: "RAG", count: 76 },
          { query: "document processing", count: 65 },
        ],
      })
    }

    // Handle trends
    if (type === "trends") {
      // Mock data for search trends
      return NextResponse.json({
        trends: [
          { date: "2023-01", count: 45 },
          { date: "2023-02", count: 52 },
          { date: "2023-03", count: 78 },
          { date: "2023-04", count: 85 },
          { date: "2023-05", count: 120 },
        ],
      })
    }

    // Default response for other GET requests
    return NextResponse.json({
      message: "Use POST for search queries or specify type parameter",
    })
  } catch (error) {
    console.error("Error in search API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
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
    console.error("Error in search API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
