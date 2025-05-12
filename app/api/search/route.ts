import { type NextRequest, NextResponse } from "next/server"
import { searchSimilarDocuments, generateAnswerFromResults } from "@/lib/ai-sdk"
import { recordSearchQuery } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url)
    const query = url.searchParams.get("query")
    const category = url.searchParams.get("category")
    const version = url.searchParams.get("version")
    const limit = Number.parseInt(url.searchParams.get("limit") || "5", 10)
    const generateAnswer = url.searchParams.get("generateAnswer") === "true"

    // Check if query is provided
    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    // Create filters if category or version is provided
    const filters: Record<string, any> = {}
    if (category) {
      filters.category = category
    }
    if (version) {
      filters.version = version
    }

    // Search for similar documents
    const results = await searchSimilarDocuments(query, Object.keys(filters).length > 0 ? filters : undefined, limit)

    // Record the search query
    await recordSearchQuery(query, results.length)

    // Generate answer if requested
    let answer = null
    if (generateAnswer && results.length > 0) {
      answer = await generateAnswerFromResults(query, results)
    }

    return NextResponse.json({
      results,
      count: results.length,
      query,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      answer,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 })
  }
}
