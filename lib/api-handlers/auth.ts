/**
 * Auth API Handlers
 * Centralizes all authentication-related API functionality
 */
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Handle OAuth callback
export async function handleAuthCallback(req: NextRequest) {
  try {
    const requestUrl = new URL(req.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
      const cookieStore = cookies()
      const supabase = createClient({ cookies: () => cookieStore })
      await supabase.auth.exchangeCodeForSession(code)
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(requestUrl.origin)
  } catch (error) {
    console.error("Error in handleAuthCallback:", error)
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error instanceof Error ? error.message : "Unknown error")}`,
        req.nextUrl.origin,
      ),
    )
  }
}

// Check if user is admin
export async function isUserAdmin(userId: string) {
  try {
    // This is a placeholder. In a real application, you would check
    // if the user has admin privileges in your database.
    const supabase = createClient({ cookies })
    const { data, error } = await supabase.from("admins").select("*").eq("user_id", userId).single()

    if (error) {
      console.error("Error checking admin status:", error)
      return { isAdmin: false }
    }

    return { isAdmin: !!data }
  } catch (error) {
    console.error("Error in isUserAdmin:", error)
    return { isAdmin: false }
  }
}

// Get current session
export async function getCurrentSession() {
  try {
    const supabase = createClient({ cookies })
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session:", error)
      return { error }
    }

    return { session: data.session }
  } catch (error) {
    console.error("Error in getCurrentSession:", error)
    return { error }
  }
}
