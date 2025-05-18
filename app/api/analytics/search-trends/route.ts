import { NextResponse } from "next/server"
import { getSearchTrends } from "@/lib/api-handlers/analytics"
import { MOCK_SEARCH_TRENDS } from "@/lib/mock-data"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams
    const period = searchParams.get("period") || "week"

    const { data, error } = await getSearchTrends(period)

    if (error) {
      console.error("Error fetching search trends:", error)
      return NextResponse.json({
        trends: MOCK_SEARCH_TRENDS,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    }

    return NextResponse.json({
      trends: data || MOCK_SEARCH_TRENDS,
      status: "success",
    })
  } catch (error) {
    console.error("Error in search trends API:", error)

    return NextResponse.json({
      trends: MOCK_SEARCH_TRENDS,
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
