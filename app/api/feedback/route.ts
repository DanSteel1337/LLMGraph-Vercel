import { type NextRequest, NextResponse } from "next/server"
import {
  getAllFeedback,
  getFeedbackById,
  submitFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackStats,
} from "@/lib/api-handlers/feedback"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

// Main feedback endpoint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const type = searchParams.get("type") || "all"

    // Handle different feedback-related requests
    switch (type) {
      case "stats":
        const { data: statsData, error: statsError } = await getFeedbackStats()

        if (statsError) {
          return NextResponse.json({ error: statsError.message }, { status: 500 })
        }

        return NextResponse.json(statsData)

      case "single":
        if (!id) {
          return NextResponse.json({ error: "Feedback ID is required" }, { status: 400 })
        }

        const { data: singleData, error: singleError } = await getFeedbackById(id)

        if (singleError) {
          return NextResponse.json({ error: singleError.message }, { status: 500 })
        }

        return NextResponse.json({ feedback: singleData })

      case "all":
      default:
        const { data, error } = await getAllFeedback()

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ feedback: data })
    }
  } catch (error) {
    console.error("Error in GET /api/feedback:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

// Submit feedback
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { rating, comment, source, userId } = body

    if (!rating) {
      return NextResponse.json({ error: "Rating is required" }, { status: 400 })
    }

    const { data, error } = await submitFeedback({
      rating,
      comment: comment || "",
      source: source || "unknown",
      user_id: userId || null,
      created_at: new Date().toISOString(),
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ feedback: data }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/feedback:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

// Update feedback
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Feedback ID is required" }, { status: 400 })
    }

    const body = await req.json()
    const { data, error } = await updateFeedback(id, body)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ feedback: data })
  } catch (error) {
    console.error("Error in PUT /api/feedback:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

// Delete feedback
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Feedback ID is required" }, { status: 400 })
    }

    const { error, success } = await deleteFeedback(id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success })
  } catch (error) {
    console.error("Error in DELETE /api/feedback:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
