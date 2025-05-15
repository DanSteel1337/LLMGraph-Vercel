import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// GET: Get feedback statistics
export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from("feedback")
      .select("status, count")
      .group("status")

    if (statusError) {
      console.error("Error fetching feedback status counts:", statusError)
      return NextResponse.json({ error: statusError.message }, { status: 500 })
    }

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from("feedback")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error fetching total feedback count:", countError)
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    // Format the response
    const stats = {
      total: totalCount || 0,
      byStatus: statusCounts.reduce(
        (acc, item) => {
          acc[item.status] = Number.parseInt(item.count)
          return acc
        },
        {} as Record<string, number>,
      ),
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error in GET /api/feedback/stats:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
