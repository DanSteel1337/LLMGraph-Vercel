import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "week"
    const metric = searchParams.get("metric") || "all"

    const supabase = getSupabaseClient()

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case "day":
        startDate = new Date(now.setDate(now.getDate() - 1))
        break
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      default:
        startDate = new Date(now.setDate(now.getDate() - 7))
    }

    const startDateStr = startDate.toISOString()

    // Fetch search analytics based on metric
    const analyticsData: any = {}

    if (metric === "all" || metric === "volume") {
      // Get search volume over time
      const { data: volumeData, error: volumeError } = await supabase
        .from("search_history")
        .select("created_at")
        .gte("created_at", startDateStr)
        .order("created_at", { ascending: true })

      if (volumeError) {
        console.error("Error fetching search volume:", volumeError)
      } else {
        // Group by day
        analyticsData.volume = processTimeSeriesData(volumeData || [], "created_at")
      }
    }

    if (metric === "all" || metric === "performance") {
      // Get search performance metrics
      const { data: perfData, error: perfError } = await supabase
        .from("search_history")
        .select("created_at, query_time_ms, result_count")
        .gte("created_at", startDateStr)
        .order("created_at", { ascending: true })

      if (perfError) {
        console.error("Error fetching search performance:", perfError)
      } else {
        // Process performance metrics
        analyticsData.performance = calculatePerformanceMetrics(perfData || [])
      }
    }

    if (metric === "all" || metric === "popular") {
      // Get popular search terms
      const { data: popularData, error: popularError } = await supabase
        .from("search_history")
        .select("query")
        .gte("created_at", startDateStr)

      if (popularError) {
        console.error("Error fetching popular searches:", popularError)
      } else {
        // Count query occurrences
        analyticsData.popular = calculatePopularQueries(popularData || [])
      }
    }

    if (metric === "all" || metric === "feedback") {
      // Get feedback metrics
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("feedback")
        .select("created_at, rating, search_query")
        .gte("created_at", startDateStr)

      if (feedbackError) {
        console.error("Error fetching feedback metrics:", feedbackError)
      } else {
        // Process feedback metrics
        analyticsData.feedback = calculateFeedbackMetrics(feedbackData || [])
      }
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Error in search analytics API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

// Helper function to process time series data
function processTimeSeriesData(data: any[], dateField: string) {
  const dateGroups: Record<string, number> = {}

  // Group by day
  data.forEach((item) => {
    const date = new Date(item[dateField])
    const dateStr = date.toISOString().split("T")[0]

    if (!dateGroups[dateStr]) {
      dateGroups[dateStr] = 0
    }

    dateGroups[dateStr]++
  })

  // Convert to array format for charts
  return Object.entries(dateGroups).map(([date, count]) => ({
    date,
    count,
  }))
}

// Helper function to calculate performance metrics
function calculatePerformanceMetrics(data: any[]) {
  // Group by day
  const dateGroups: Record<string, { times: number[]; counts: number[] }> = {}

  data.forEach((item) => {
    const date = new Date(item.created_at)
    const dateStr = date.toISOString().split("T")[0]

    if (!dateGroups[dateStr]) {
      dateGroups[dateStr] = { times: [], counts: [] }
    }

    dateGroups[dateStr].times.push(item.query_time_ms || 0)
    dateGroups[dateStr].counts.push(item.result_count || 0)
  })

  // Calculate metrics for each day
  return Object.entries(dateGroups).map(([date, metrics]) => {
    const times = metrics.times
    const counts = metrics.counts

    // Calculate average and percentiles
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
    const p95Time = calculatePercentile(times, 95)
    const avgResultCount = counts.reduce((sum, count) => sum + count, 0) / counts.length

    return {
      date,
      avgQueryTime: Math.round(avgTime),
      p95QueryTime: Math.round(p95Time),
      avgResultCount: Math.round(avgResultCount * 10) / 10,
    }
  })
}

// Helper function to calculate percentile
function calculatePercentile(values: number[], percentile: number) {
  if (values.length === 0) return 0

  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return sorted[index]
}

// Helper function to calculate popular queries
function calculatePopularQueries(data: any[]) {
  const queryCounts: Record<string, number> = {}

  data.forEach((item) => {
    const query = item.query?.toLowerCase()
    if (!query) return

    if (!queryCounts[query]) {
      queryCounts[query] = 0
    }

    queryCounts[query]++
  })

  // Convert to array and sort by count
  return Object.entries(queryCounts)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10
}

// Helper function to calculate feedback metrics
function calculateFeedbackMetrics(data: any[]) {
  // Group by day
  const dateGroups: Record<string, { ratings: number[]; total: number }> = {}

  data.forEach((item) => {
    const date = new Date(item.created_at)
    const dateStr = date.toISOString().split("T")[0]

    if (!dateGroups[dateStr]) {
      dateGroups[dateStr] = { ratings: [], total: 0 }
    }

    dateGroups[dateStr].ratings.push(item.rating || 0)
    dateGroups[dateStr].total++
  })

  // Calculate metrics for each day
  return Object.entries(dateGroups).map(([date, metrics]) => {
    const ratings = metrics.ratings
    const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    const positiveRatings = ratings.filter((r) => r >= 4).length
    const positiveRate = (positiveRatings / ratings.length) * 100

    return {
      date,
      avgRating: Math.round(avgRating * 10) / 10,
      positiveRate: Math.round(positiveRate),
      feedbackCount: metrics.total,
    }
  })
}
