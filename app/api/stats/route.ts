import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getSystemStats } from "@/lib/api-handlers/system"
import { shouldUseMockData } from "@/lib/environment"
import { MOCK_STATS } from "@/lib/mock-data"

export const runtime = "edge"

export async function GET(request: Request) {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      return NextResponse.json({
        ...MOCK_STATS,
        isMockData: true,
      })
    }

    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If not authenticated, return 401 JSON response
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in to access this resource." }, { status: 401 })
    }

    // Get stats data
    const stats = await getSystemStats()

    // Return JSON response
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error in stats API route:", error)

    // Return error as JSON
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        message: error instanceof Error ? error.message : String(error),
        ...MOCK_STATS,
        isMockData: true,
      },
      { status: 500 },
    )
  }
}
