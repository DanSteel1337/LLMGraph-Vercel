import { NextResponse } from "next/server"
import { supabaseClient } from "@/lib/supabase/client"

export async function GET() {
  try {
    // Get the current date
    const now = new Date()

    // Get the date 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(now.getDate() - 30)

    // Format dates for SQL query
    const fromDate = thirtyDaysAgo.toISOString()
    const toDate = now.toISOString()

    // Query search history grouped by day
    const { data, error } = await supabaseClient
      .from("search_history")
      .select("created_at, results_count")
      .gte("created_at", fromDate)
      .lte("created_at", toDate)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching search trends:", error)
      return NextResponse.json({ error: "Failed to fetch search trends" }, { status: 500 })
    }

    // Process data to group by day
    const dailyData: Record<string, { searches: number; successCount: number; totalCount: number }> = {}

    data.forEach((item) => {
      // Extract date part only
      const date = new Date(item.created_at).toISOString().split("T")[0]

      if (!dailyData[date]) {
        dailyData[date] = { searches: 0, successCount: 0, totalCount: 0 }
      }

      dailyData[date].searches++
      dailyData[date].totalCount++

      // Count as success if there were results
      if (item.results_count > 0) {
        dailyData[date].successCount++
      }
    })

    // Fill in missing dates in the 30-day range
    const result = []
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo)
      date.setDate(thirtyDaysAgo.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]

      const dayData = dailyData[dateStr] || { searches: 0, successCount: 0, totalCount: 0 }
      const successRate = dayData.totalCount > 0 ? Math.round((dayData.successCount / dayData.totalCount) * 100) : 0

      result.push({
        date: dateStr,
        searches: dayData.searches,
        successRate,
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in search trends API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
