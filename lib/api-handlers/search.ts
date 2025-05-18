/**
 * Search API Handlers
 * Centralizes all search-related API functionality
 */
import { createClient } from "@/lib/supabase/server"
import { searchSimilarDocuments } from "@/lib/search"
import { MOCK_SEARCH_RESULTS, MOCK_POPULAR_SEARCHES, MOCK_SEARCH_TRENDS } from "@/lib/mock-data"
import { shouldUseMockData } from "@/lib/environment"

// Perform a search
export async function performSearch(query: string, options: any = {}) {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      return {
        results: MOCK_SEARCH_RESULTS,
        metadata: {
          query,
          options,
          timestamp: new Date().toISOString(),
        },
        isMockData: true,
      }
    }

    // Perform the search using the AI SDK
    const results = await searchSimilarDocuments(query, options)

    // Track the search query for analytics
    await trackSearchQuery(query, options.userId)

    return {
      results,
      metadata: {
        query,
        options,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("Error in performSearch:", error)
    return {
      results: MOCK_SEARCH_RESULTS,
      error: error instanceof Error ? error.message : "Unknown error",
      metadata: {
        query,
        options,
        timestamp: new Date().toISOString(),
      },
      isMockData: true,
    }
  }
}

// Track a search query
export async function trackSearchQuery(query: string, userId?: string) {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      return { success: true, isMockData: true }
    }

    const supabase = createClient()

    // Insert the search query into the database
    const { error } = await supabase.from("search_analytics").insert({
      query,
      user_id: userId,
      timestamp: new Date().toISOString(),
    })

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error in trackSearchQuery:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get popular searches
export async function getPopularSearches(limit = 10) {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      return {
        data: MOCK_POPULAR_SEARCHES.slice(0, limit),
        isMockData: true,
      }
    }

    const supabase = createClient()

    // Get popular searches from the database
    const { data, error } = await supabase
      .from("search_analytics")
      .select("query, count(*)")
      .group("query")
      .order("count", { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    // Format the data
    const formattedData = data.map((item: any) => ({
      query: item.query,
      count: item.count,
    }))

    return { data: formattedData }
  } catch (error) {
    console.error("Error in getPopularSearches:", error)
    return {
      data: MOCK_POPULAR_SEARCHES.slice(0, limit),
      error: error instanceof Error ? error.message : "Unknown error",
      isMockData: true,
    }
  }
}

// Get search trends
export async function getSearchTrends(period = "week") {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      return {
        data: MOCK_SEARCH_TRENDS.map((item, index) => ({
          date: new Date(Date.now() - index * 86400000).toISOString().split("T")[0],
          searches: item.count,
        })),
        isMockData: true,
      }
    }

    const supabase = createClient()

    // Determine the time range based on the period
    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Get search trends from the database
    const { data, error } = await supabase
      .from("search_analytics")
      .select("timestamp")
      .gte("timestamp", startDate.toISOString())
      .lte("timestamp", now.toISOString())

    if (error) {
      throw error
    }

    // Group by date and count
    const trendsByDate: Record<string, number> = {}

    data.forEach((item: any) => {
      const date = item.timestamp.split("T")[0]
      trendsByDate[date] = (trendsByDate[date] || 0) + 1
    })

    // Format the data
    const formattedData = Object.entries(trendsByDate).map(([date, searches]) => ({
      date,
      searches,
    }))

    // Sort by date
    formattedData.sort((a, b) => (a.date > b.date ? 1 : -1))

    return { data: formattedData }
  } catch (error) {
    console.error("Error in getSearchTrends:", error)
    return {
      data: MOCK_SEARCH_TRENDS.map((item, index) => ({
        date: new Date(Date.now() - index * 86400000).toISOString().split("T")[0],
        searches: item.count,
      })),
      error: error instanceof Error ? error.message : "Unknown error",
      isMockData: true,
    }
  }
}
