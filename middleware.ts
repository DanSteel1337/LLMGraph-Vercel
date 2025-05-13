import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  try {
    // Create a Supabase client configured to use cookies
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired - required for Server Components
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Get the pathname
    const path = req.nextUrl.pathname

    // Define public paths that don't require authentication
    const isPublicPath =
      path === "/login" ||
      path.startsWith("/api/auth") ||
      path === "/signup" ||
      path === "/reset-password" ||
      path.startsWith("/_next") ||
      path === "/favicon.ico"

    // If the path is not public and there's no session, redirect to login
    if (!isPublicPath && !session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/login"
      redirectUrl.searchParams.set("redirect", path)
      return NextResponse.redirect(redirectUrl)
    }

    // If the path is login and there's a session, redirect to home
    if (path === "/login" && session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/"
      return NextResponse.redirect(redirectUrl)
    }

    // Clone the response
    const response = NextResponse.next()

    // Add security headers
    const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https://*.stripe.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.stripe.com https://api.openai.com;
    frame-src 'self' https://*.stripe.com;
  `
      .replace(/\s{2,}/g, " ")
      .trim()

    response.headers.set("Content-Security-Policy", cspHeader)

    // Add other security headers
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    // Return the original response if there's an error
    return NextResponse.next()
  }
}

// Only apply middleware to API routes and pages that need it
export const config = {
  matcher: [
    // Apply to all routes except static files and api routes that need to bypass CSP
    "/((?!_next/static|_next/image|favicon.ico|api/bypass-csp).*)",
  ],
}
