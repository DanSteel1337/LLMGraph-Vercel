import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use edge runtime for better serverless compatibility
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

    // Get the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Query for search history grouped by day
    const { data, error } = await supabase
      .from("search_history")
      .select("created_at, results_count")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching search trends:", error)
      return NextResponse.json({ error: error.message }, { status: 200 }) // Return 200 even for errors
    }

    // Process the data to get daily trends
    const dailyTrends = processDailyTrends(data || [])

    return NextResponse.json(dailyTrends)
  } catch (error) {
    console.error("Error in search trends API:", error)
    return NextResponse.json(
      {
        error: `Failed to fetch search trends: ${error instanceof Error ? error.message : String(error)}`,
        data: generateSampleTrends(), // Return sample data even on error
      },
      { status: 200 }, // Return 200 even for errors
    )
  }
}

// Helper function to process daily trends
function processDailyTrends(searchData: any[]) {
  // If no data, return sample data for UI testing
  if (searchData.length === 0) {
    return generateSampleTrends()
  }

  const dailyMap = new Map()

  // Group searches by day
  searchData.forEach((item) => {
    const date = new Date(item.created_at).toISOString().split("T")[0]

    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        searches: 0,
        successfulSearches: 0,
      })
    }

    const dayData = dailyMap.get(date)
    dayData.searches++

    // Count as successful if results were found
    if (item.results_count > 0) {
      dayData.successfulSearches++
    }
  })

  // Convert to array and calculate success rate
  const result = Array.from(dailyMap.entries()).map(([date, data]) => {
    const { searches, successfulSearches } = data
    const successRate = searches > 0 ? Math.round((successfulSearches / searches) * 100) : 0

    return {
      date,
      searches,
      successRate,
    }
  })

  // Fill in missing days
  return fillMissingDays(result)
}

// Helper to fill in missing days in the data
function fillMissingDays(data) {
  if (data.length === 0) return []

  const result = []
  const startDate = new Date(data[0].date)
  const endDate = new Date()

  // Create a map of existing data
  const dataMap = new Map(data.map((item) => [item.date, item]))

  // Fill in all days
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0]

    if (dataMap.has(dateStr)) {
      result.push(dataMap.get(dateStr))
    } else {
      result.push({
        date: dateStr,
        searches: 0,
        successRate: 0,
      })
    }
  }

  return result
}

// Generate sample data for UI testing when no real data exists
function generateSampleTrends() {
  const result = []
  const endDate = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(endDate.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    result.push({
      date: dateStr,
      searches: 0,
      successRate: 0,
    })
  }

  return result
}
