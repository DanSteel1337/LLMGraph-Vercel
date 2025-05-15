import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// POST: Submit feedback for a search result
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const body = await request.json()

    // Validate required fields
    if (!body.query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    // Get user ID if authenticated
    let userId = null
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      userId = session.user.id
    }

    // Prepare the feedback data
    const feedbackData = {
      document_id: body.documentId || null,
      content: body.query,
      correction: body.correction || null,
      status: "pending",
      user_id: userId,
    }

    // Insert the feedback
    const { data, error } = await supabase.from("feedback").insert(feedbackData).select().single()

    if (error) {
      console.error("Error submitting feedback:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also record this in search_history if it's a search query
    if (body.isSearchQuery) {
      await supabase.from("search_history").insert({
        query: body.query,
        results_count: body.resultsCount || 0,
        user_id: userId,
      })
    }

    return NextResponse.json({ feedback: data }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/feedback/submit:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
