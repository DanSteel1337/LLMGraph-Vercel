import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use Node.js runtime for Supabase
export const runtime = "nodejs"

// Create a fresh Supabase client for each request
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    // Get search trends for the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data, error } = await supabase
      .from("search_history")
      .select("created_at")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true })

    if (error) {
      throw error
    }

    // Group by day
    const trendsByDay = data.reduce((acc: Record<string, number>, item) => {
      const date = new Date(item.created_at).toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // Fill in missing days
    const trends = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      trends.unshift({
        date: dateStr,
        searches: trendsByDay[dateStr] || 0,
      })
    }

    return NextResponse.json(trends)
  } catch (error) {
    console.error("Error fetching search trends:", error)
    return NextResponse.json({ error: "Failed to fetch search trends" }, { status: 500 })
  }
}
