import { createClient } from "@/lib/supabase/server"
import { performSearch as hybridSearch } from "@/lib/search"
import { MOCK_POPULAR_SEARCHES, MOCK_SEARCH_TRENDS } from "@/lib/mock-data"

// Search documents
export async function performSearch(query: string, filters?: any) {
  try {
    const results = await hybridSearch(query, filters)
    return { results }
  } catch (error) {
    console.error("Error searching documents:", error)
    return { error }
  }
}

// Track search query
export async function trackSearch(query: string, userId?: string) {
  try {
    const supabase = createClient()
    const { error } = await supabase.from("search_history").insert({
      query,
      user_id: userId || null,
      timestamp: new Date().toISOString(),
    })

    if (error) {
      console.error("Error tracking search:", error)
      return { error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in trackSearch:", error)
    return { error }
  }
}

// Get popular searches
export async function getPopularSearches(limit = 10) {
  try {
    // Check if we should use mock data
    if (process.env.USE_MOCK_DATA === "true") {
      return { data: MOCK_POPULAR_SEARCHES }
    }

    const supabase = createClient()

    // Get the most popular searches
    const { data, error } = await supabase
      .from("search_history")
      .select("query")
      .order("created_at", { ascending: false })
      .limit(100) // Get more than we need for processing

    if (error) {
      throw error
    }

    // Count occurrences of each query
    const queryCounts: Record<string, number> = {}
    data.forEach((item) => {
      const query = item.query.toLowerCase().trim()
      queryCounts[query] = (queryCounts[query] || 0) + 1
    })

    // Convert to array and sort by count
    const popularSearches = Object.entries(queryCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    return { data: popularSearches }
  } catch (error) {
    console.error("Error fetching popular searches:", error)
    return { data: MOCK_POPULAR_SEARCHES, error }
  }
}

// Get search trends
export async function getSearchTrends(days = 7) {
  try {
    // Check if we should use mock data
    if (process.env.USE_MOCK_DATA === "true") {
      return { data: MOCK_SEARCH_TRENDS }
    }

    const supabase = createClient()

    // Get search trends for the specified number of days
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - days)

    const { data, error } = await supabase
      .from("search_history")
      .select("created_at")
      .gte("created_at", daysAgo.toISOString())
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
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      trends.unshift({
        date: dateStr,
        searches: trendsByDay[dateStr] || 0,
      })
    }

    return { data: trends }
  } catch (error) {
    console.error("Error fetching search trends:", error)
    return { data: MOCK_SEARCH_TRENDS, error }
  }
}
