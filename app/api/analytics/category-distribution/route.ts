import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
      return NextResponse.json(
        {
          error: "Failed to fetch category distribution",
          details: error.message,
        },
        { status: 500 },
      )
    }

    // If no data, return mock data
    if (!data || data.length === 0) {
      return NextResponse.json({
        categories: [
          { category: "Documentation", count: 45 },
          { category: "API Reference", count: 32 },
          { category: "Tutorials", count: 28 },
          { category: "Guides", count: 15 },
          { category: "Examples", count: 10 },
        ],
      })
    }

    return NextResponse.json({ categories: data })
  } catch (error) {
    console.error("Error in category distribution API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
