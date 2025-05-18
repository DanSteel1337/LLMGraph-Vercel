import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getSystemStats } from "@/lib/api-handlers/system"

export async function GET(request: Request) {
  try {
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
      },
      { status: 500 },
    )
  }
}
