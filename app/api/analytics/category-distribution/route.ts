import { NextResponse } from "next/server"
import { getCategoryDistribution } from "@/lib/api-handlers/analytics"
import { MOCK_CATEGORY_DISTRIBUTION } from "@/lib/mock-data"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

export async function GET() {
  try {
    const { data, error } = await getCategoryDistribution()

    if (error) {
      console.error("Error fetching category distribution:", error)
      // Return mock data instead of error
      return NextResponse.json({
        categories: MOCK_CATEGORY_DISTRIBUTION,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    }

    return NextResponse.json({
      categories: data || MOCK_CATEGORY_DISTRIBUTION,
      status: "success",
    })
  } catch (error) {
    console.error("Error in category distribution API:", error)
    // Always return JSON, even on error
    return NextResponse.json({
      categories: MOCK_CATEGORY_DISTRIBUTION,
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
