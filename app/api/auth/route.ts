import { type NextRequest, NextResponse } from "next/server"
import { handleAuthCallback, isUserAdmin, getCurrentSession } from "@/lib/api-handlers/auth"
import { shouldUseMockData } from "@/lib/environment"

export const runtime = "edge" // Use Edge runtime for better performance

// Main auth endpoint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "session"

    // Check if we should use mock data
    if (shouldUseMockData()) {
      // Return mock data based on request type
      switch (type) {
        case "callback":
          return NextResponse.json({ success: true, isMockData: true })
        case "admin":
          return NextResponse.json({ isAdmin: true, isMockData: true })
        case "session":
        default:
          return NextResponse.json({
            session: {
              user: {
                id: "mock-user-id",
                email: "mock-user@example.com",
                name: "Mock User",
                role: "admin",
              },
              expires_at: Date.now() + 86400000, // 24 hours from now
            },
            isMockData: true,
          })
      }
    }

    // Handle different auth-related requests
    switch (type) {
      case "callback":
        return handleAuthCallback(req)

      case "admin":
        const { session } = await getCurrentSession()

        if (!session?.user) {
          return NextResponse.json({ isAdmin: false })
        }

        const { isAdmin } = await isUserAdmin(session.user.id)
        return NextResponse.json({ isAdmin })

      case "session":
      default:
        const { session: currentSession, error } = await getCurrentSession()

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ session: currentSession })
    }
  } catch (error) {
    console.error("Error in GET /api/auth:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
