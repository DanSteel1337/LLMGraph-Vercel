import { supabase } from "@/lib/supabase/client"

/**
 * Get search trends data for the specified period
 * @param period - The time period to get data for (week, month, year)
 */
export async function getSearchTrendsData(period = "week") {
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
      return getMockSearchTrendsData(period)
    }

    // Query the database for search trends
    const { data, error } = await supabase
      .from("search_logs")
      .select("created_at, query, success")
      .gte("created_at", startDateStr)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching search trends from database:", error)
      return getMockSearchTrendsData(period)
    }

    // Process the data to get daily aggregates
    const dailyData = processSearchTrendsData(data)

    return dailyData
  } catch (error) {
    console.error("Error in getSearchTrendsData:", error)
    return getMockSearchTrendsData(period)
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

/**
 * Get mock search trends data for development and testing
 */
function getMockSearchTrendsData(period: string) {
  // Base mock data for a week
  const mockWeekData = [
    { date: "2023-05-01", searches: 45, successRate: 82 },
    { date: "2023-05-02", searches: 52, successRate: 78 },
    { date: "2023-05-03", searches: 61, successRate: 85 },
    { date: "2023-05-04", searches: 48, successRate: 79 },
    { date: "2023-05-05", searches: 64, successRate: 88 },
    { date: "2023-05-06", searches: 57, successRate: 84 },
    { date: "2023-05-07", searches: 68, successRate: 91 },
  ]

  // For longer periods, generate more data
  if (period === "2weeks") {
    const previousWeek = [
      { date: "2023-04-24", searches: 42, successRate: 80 },
      { date: "2023-04-25", searches: 49, successRate: 76 },
      { date: "2023-04-26", searches: 58, successRate: 83 },
      { date: "2023-04-27", searches: 45, successRate: 77 },
      { date: "2023-04-28", searches: 61, successRate: 86 },
      { date: "2023-04-29", searches: 54, successRate: 82 },
      { date: "2023-04-30", searches: 65, successRate: 89 },
    ]
    return [...previousWeek, ...mockWeekData]
  } else if (period === "month") {
    // Generate a month's worth of data
    const result = []
    const baseDate = new Date("2023-04-08")

    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(baseDate)
      currentDate.setDate(baseDate.getDate() + i)

      result.push({
        date: currentDate.toISOString().split("T")[0],
        searches: Math.floor(Math.random() * 30) + 40, // Random between 40-70
        successRate: Math.floor(Math.random() * 20) + 75, // Random between 75-95
      })
    }

    return result
  }

  return mockWeekData
}

/**
 * Get category distribution data
 */
export async function getCategoryDistributionData() {
  try {
    // Check if we should use mock data
    if (process.env.USE_MOCK_DATA === "true") {
      return getMockCategoryData()
    }

    // Query the database for document categories
    const { data, error } = await supabase
      .from("documents")
      .select("category, count")
      .order("count", { ascending: false })

    if (error) {
      console.error("Error fetching category distribution from database:", error)
      return getMockCategoryData()
    }

    // Process the data
    const categoryData = data.map((item) => ({
      category: item.category || "Uncategorized",
      count: item.count,
    }))

    return categoryData
  } catch (error) {
    console.error("Error in getCategoryDistributionData:", error)
    return getMockCategoryData()
  }
}

/**
 * Get mock category distribution data
 */
function getMockCategoryData() {
  return [
    { category: "Technical", count: 42 },
    { category: "Product", count: 28 },
    { category: "Support", count: 19 },
    { category: "Legal", count: 14 },
    { category: "Other", count: 8 },
  ]
}
