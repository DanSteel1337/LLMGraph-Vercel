import { type NextRequest, NextResponse } from "next/server"
import { searchSimilarDocuments } from "@/lib/ai-sdk"

export async function POST(request: NextRequest) {
  try {
    const { query, filters, limit = 5 } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Search for similar documents using text-embedding-3-large model
    const results = await searchSimilarDocuments(query, filters, limit)

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error in search API:", error)
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 })
  }
}
