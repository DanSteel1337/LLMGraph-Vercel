import { type NextRequest, NextResponse } from "next/server"
import { handleAuthCallback, isUserAdmin, getCurrentSession } from "@/lib/api-handlers/auth"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

// Main auth endpoint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "session"

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
