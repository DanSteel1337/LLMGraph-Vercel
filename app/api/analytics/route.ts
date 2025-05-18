import { type NextRequest, NextResponse } from "next/server"
import { getCategoryDistribution, getSearchTrends } from "@/lib/api-handlers/analytics"
import { MOCK_CATEGORY_DISTRIBUTION, MOCK_SEARCH_TRENDS } from "@/lib/mock-data"
import { logError } from "@/lib/error-handler"
import { validateEnvVar } from "@/lib/env-validator"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

/**
 * GET handler for analytics data
 * Supports different types of analytics via query parameters:
 * - type=category-distribution: Returns category distribution data
 * - type=search-trends: Returns search trends data (with optional period parameter)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "category-distribution"

    // Check if we should use mock data
    const useMockData = validateEnvVar("USE_MOCK_DATA", false) === "true"

    if (type === "category-distribution") {
      return handleCategoryDistribution(useMockData)
    } else if (type === "search-trends") {
      const period = searchParams.get("period") || "week"
      return handleSearchTrends(period, useMockData)
    } else {
      return NextResponse.json({ error: "Invalid analytics type", status: "error" }, { status: 400 })
    }
  } catch (error) {
    logError(error, "analytics_api_error")
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        status: "error",
      },
      { status: 500 },
    )
  }
}

/**
 * Handle category distribution analytics
 */
async function handleCategoryDistribution(useMockData: boolean) {
  try {
    // Return mock data if requested
    if (useMockData) {
      return NextResponse.json({
        categories: MOCK_CATEGORY_DISTRIBUTION,
        status: "success",
      })
    }

    const { data, error } = await getCategoryDistribution()

    if (error) {
      logError(error, "category_distribution_error")
      // Return mock data as fallback
      return NextResponse.json({
        categories: MOCK_CATEGORY_DISTRIBUTION,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Ensure we always return an array
    const categories = Array.isArray(data) ? data : data ? [data] : MOCK_CATEGORY_DISTRIBUTION

    return NextResponse.json({
      categories,
      status: "success",
    })
  } catch (error) {
    logError(error, "category_distribution_api_error")
    // Always return JSON, even on error
    return NextResponse.json({
      categories: MOCK_CATEGORY_DISTRIBUTION,
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

/**
 * Handle search trends analytics
 */
async function handleSearchTrends(period: string, useMockData: boolean) {
  try {
    // Return mock data if requested
    if (useMockData) {
      return NextResponse.json({
        trends: MOCK_SEARCH_TRENDS,
        status: "success",
      })
    }

    const { data, error } = await getSearchTrends(period)

    if (error) {
      logError(error, "search_trends_error")
      return NextResponse.json({
        trends: MOCK_SEARCH_TRENDS,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    }

    // Ensure we always return an array
    const trends = Array.isArray(data) ? data : data ? [data] : MOCK_SEARCH_TRENDS

    return NextResponse.json({
      trends,
      status: "success",
    })
  } catch (error) {
    logError(error, "search_trends_api_error")

    return NextResponse.json({
      trends: MOCK_SEARCH_TRENDS,
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
