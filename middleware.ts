import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
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
    path === "/login" || path.startsWith("/api/auth") || path === "/signup" || path === "/reset-password"

  // Check for mock token in cookies
  const mockToken = req.cookies.get("mock_auth_token")?.value

  // If the path is not public and there's no session or mock token, redirect to login
  if (!isPublicPath && !session && !mockToken) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(redirectUrl)
  }

  // If the path is login and there's a session or mock token, redirect to home
  if (path === "/login" && (session || mockToken)) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/"
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
