import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logError } from "@/lib/error-handler"

/**
 * Handles the auth callback from Supabase
 */
export async function handleAuthCallback(req: NextRequest) {
  try {
    const requestUrl = new URL(req.url)
    const code = requestUrl.searchParams.get("code")

    if (!code) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const supabase = createClient()

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)

    // Redirect to the dashboard or the original URL
    const redirectTo = requestUrl.searchParams.get("redirect") || "/dashboard"
    return NextResponse.redirect(new URL(redirectTo, req.url))
  } catch (error) {
    logError(error, "auth_callback_error")
    console.error("Error in auth callback:", error)
    return NextResponse.redirect(new URL("/login?error=callback_failed", req.url))
  }
}

/**
 * Gets the current session
 */
export async function getCurrentSession() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getSession()
    return { session: data.session, error }
  } catch (error) {
    logError(error, "get_session_error")
    return { session: null, error: error instanceof Error ? error : new Error("Unknown error") }
  }
}

/**
 * Checks if a user is an admin
 */
export async function isUserAdmin(userId: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("admins").select("*").eq("user_id", userId).single()

    if (error) {
      throw error
    }

    return { isAdmin: !!data, error: null }
  } catch (error) {
    logError(error, "admin_check_error")
    return { isAdmin: false, error: error instanceof Error ? error : new Error("Unknown error") }
  }
}
