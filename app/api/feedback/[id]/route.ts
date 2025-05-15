import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// GET: Fetch a single feedback item
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const id = params.id

    // Query the feedback table for the specific ID
    const { data, error } = await supabase.from("feedback").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        // PGRST116 is the error code for "not found"
        return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
      }

      console.error(`Error fetching feedback ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ feedback: data })
  } catch (error) {
    console.error(`Error in GET /api/feedback/${params.id}:`, error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

// PATCH: Update a feedback item
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const id = params.id
    const body = await request.json()

    // Validate the status
    if (body.status && !["pending", "reviewed", "resolved"].includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'pending', 'reviewed', or 'resolved'" },
        { status: 400 },
      )
    }

    // Update the feedback
    const { data, error } = await supabase.from("feedback").update(body).eq("id", id).select().single()

    if (error) {
      console.error(`Error updating feedback ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    return NextResponse.json({ feedback: data })
  } catch (error) {
    console.error(`Error in PATCH /api/feedback/${params.id}:`, error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

// DELETE: Delete a feedback item
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const id = params.id

    // Delete the feedback
    const { error } = await supabase.from("feedback").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting feedback ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error in DELETE /api/feedback/${params.id}:`, error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
