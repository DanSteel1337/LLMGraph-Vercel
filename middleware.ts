import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { logError } from "@/lib/error-handler"

// Define protected routes that require authentication
const protectedRoutes = ["/documents", "/upload", "/admin", "/settings"]

// Track if we've already logged the "no session" message
let hasLoggedNoSession = false

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    // Create a Supabase client for the middleware
    const supabase = createServerClient()

    // Check if the user is authenticated
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      // Only log in development
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Middleware] Auth error:", error.message)
      }
      logError(error, "middleware_auth_error")
    }

    // Get the pathname from the request
    const { pathname } = req.nextUrl

    // Check if the route is protected and the user is not authenticated
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    if (isProtectedRoute && !session) {
      // Only log once in production
      if (!hasLoggedNoSession && process.env.NODE_ENV === "production") {
        console.log("[Middleware] No active session found, redirecting to login")
        hasLoggedNoSession = true
      }

      // Redirect to login page if not authenticated
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    // Log error and continue
    logError(error, "middleware_error")
    return res
  }
}

export const config = {
  // Only run middleware on specific paths
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes that handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
}
