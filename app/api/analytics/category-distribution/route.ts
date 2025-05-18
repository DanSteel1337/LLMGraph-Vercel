import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { MOCK_CATEGORY_DISTRIBUTION } from "@/lib/mock-data"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

export async function GET() {
  try {
    const supabase = createClient()

    // Query to get document counts by category
    const { data, error } = await supabase
      .from("documents")
      .select("category, count")
      .order("count", { ascending: false })
      .group("category")

    if (error) {
      console.error("Error fetching category distribution:", error)
      // Return mock data instead of error
      return NextResponse.json({ categories: MOCK_CATEGORY_DISTRIBUTION })
    }

    // If no data, return mock data
    if (!data || data.length === 0) {
      return NextResponse.json({ categories: MOCK_CATEGORY_DISTRIBUTION })
    }

    return NextResponse.json({ categories: data })
  } catch (error) {
    console.error("Error in category distribution API:", error)
    // Always return JSON, even on error
    return NextResponse.json({
      categories: MOCK_CATEGORY_DISTRIBUTION,
      error: "An error occurred while fetching category distribution",
    })
  }
}
