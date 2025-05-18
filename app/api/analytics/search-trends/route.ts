import { NextResponse } from "next/server"
import { getSearchTrendsData } from "@/lib/api-handlers/analytics"

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams
    const period = searchParams.get("period") || "week"

    const data = await getSearchTrendsData(period)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error fetching search trends:", error)

    // Return mock data as fallback
    const mockData = [
      { date: "2023-05-01", searches: 45, successRate: 82 },
      { date: "2023-05-02", searches: 52, successRate: 78 },
      { date: "2023-05-03", searches: 61, successRate: 85 },
      { date: "2023-05-04", searches: 48, successRate: 79 },
      { date: "2023-05-05", searches: 64, successRate: 88 },
      { date: "2023-05-06", searches: 57, successRate: 84 },
      { date: "2023-05-07", searches: 68, successRate: 91 },
    ]

    return NextResponse.json({
      success: true,
      data: mockData,
      isMockData: true,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    })
  }
}
