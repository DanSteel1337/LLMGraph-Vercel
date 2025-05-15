import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// GET: Fetch all feedback
export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Query the feedback table
    const { data, error } = await supabase.from("feedback").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching feedback:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ feedback: data })
  } catch (error) {
    console.error("Error in GET /api/feedback:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

// POST: Create new feedback
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const body = await request.json()

    // Validate required fields
    if (!body.content) {
      return NextResponse.json({ error: "Feedback content is required" }, { status: 400 })
    }

    // Prepare the feedback data
    const feedbackData = {
      document_id: body.documentId || null,
      content: body.content,
      correction: body.correction || null,
      status: body.status || "pending",
      user_id: body.userId || null,
    }

    // Insert the feedback
    const { data, error } = await supabase.from("feedback").insert(feedbackData).select().single()

    if (error) {
      console.error("Error creating feedback:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ feedback: data }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/feedback:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
