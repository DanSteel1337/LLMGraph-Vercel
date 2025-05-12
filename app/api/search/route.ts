import { type NextRequest, NextResponse } from "next/server"
import { searchSimilarDocuments } from "@/lib/ai-sdk"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url)
    const query = url.searchParams.get("query")
    const category = url.searchParams.get("category")
    const limit = Number.parseInt(url.searchParams.get("limit") || "5", 10)

    // Check if query is provided
    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    // Create filters if category is provided
    const filters = category ? { category } : undefined

    // Search for similar documents
    const results = await searchSimilarDocuments(query, filters, limit)

    // Get Supabase client
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Record search in history if user is authenticated
    if (session) {
      await supabase.from("search_history").insert({
        user_id: session.user.id,
        query,
        results_count: results.length,
      })
    }

    return NextResponse.json({
      results,
      count: results.length,
      query,
      filters,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 })
  }
}
