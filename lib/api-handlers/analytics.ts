import { supabase } from "@/lib/supabase/client"
import { MOCK_CATEGORY_DISTRIBUTION, MOCK_SEARCH_TRENDS } from "@/lib/mock-data"

/**
 * Get category distribution data
 */
export async function getCategoryDistribution() {
  try {
    // Check if we should use mock data
    if (process.env.USE_MOCK_DATA === "true") {
      return { data: MOCK_CATEGORY_DISTRIBUTION }
    }

    // Query the database for document categories
    const { data, error } = await supabase
      .from("documents")
      .select("category, count")
      .order("count", { ascending: false })
      .group("category")

    if (error) {
      console.error("Error fetching category distribution from database:", error)
      return { data: MOCK_CATEGORY_DISTRIBUTION, error }
    }

    // Process the data
    const categoryData = data.map((item) => ({
      category: item.category || "Uncategorized",
      count: item.count,
    }))

    return { data: categoryData }
  } catch (error) {
    console.error("Error in getCategoryDistribution:", error)
    return { data: MOCK_CATEGORY_DISTRIBUTION, error }
  }
}

/**
 * Get search trends data for the specified period
 * @param period - The time period to get data for (week, month, year)
 */
export async function getSearchTrends(period = "week") {
  try {
    // Define the time range based on the period
    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "2weeks":
        startDate.setDate(now.getDate() - 14)
        break
      case "month":
        startDate.setDate(now.getDate() - 30)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7) // Default to week
    }

    // Format dates for the query
    const startDateStr = startDate.toISOString().split("T")[0]

    // Check if we should use mock data
    if (process.env.USE_MOCK_DATA === "true") {
      return { data: MOCK_SEARCH_TRENDS }
    }

    // Query the database for search trends
    const { data, error } = await supabase
      .from("search_logs")
      .select("created_at, query, success")
      .gte("created_at", startDateStr)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching search trends from database:", error)
      return { data: MOCK_SEARCH_TRENDS, error }
    }

    // Process the data to get daily aggregates
    const dailyData = processSearchTrendsData(data)

    return { data: dailyData }
  } catch (error) {
    console.error("Error in getSearchTrends:", error)
    return { data: MOCK_SEARCH_TRENDS, error }
  }
}

/**
 * Process raw search logs into daily aggregated data
 */
function processSearchTrendsData(data: any[]) {
  // Group searches by date
  const groupedByDate: Record<string, { searches: number; successes: number }> = {}

  data.forEach((item) => {
    const date = new Date(item.created_at).toISOString().split("T")[0]

    if (!groupedByDate[date]) {
      groupedByDate[date] = { searches: 0, successes: 0 }
    }

    groupedByDate[date].searches++
    if (item.success) {
      groupedByDate[date].successes++
    }
  })

  // Convert to array format with success rate calculation
  return Object.entries(groupedByDate)
    .map(([date, stats]) => {
      const successRate = stats.searches > 0 ? Math.round((stats.successes / stats.searches) * 100) : 0

      return {
        date,
        searches: stats.searches,
        successRate,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}
