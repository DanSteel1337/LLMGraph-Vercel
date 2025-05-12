import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  console.log(`Middleware processing path: ${path}`)

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/login" ||
    path === "/verify-login" ||
    path.startsWith("/api/auth") ||
    path.startsWith("/_next") ||
    path === "/favicon.ico"

  console.log(`Is public path: ${isPublicPath}`)

  // Get the token from the cookies
  const token = request.cookies.get("auth_token")?.value

  console.log(`Auth token exists: ${!!token}`)

  // If the path is not public and there's no token, redirect to login
  if (!isPublicPath && !token) {
    console.log(`Redirecting to login from: ${path}`)

    // Create a new URL for the login page
    const url = request.nextUrl.clone()
    url.pathname = "/login"

    // Add the original URL as a parameter to redirect after login
    url.search = `?redirect=${encodeURIComponent(path)}`

    return NextResponse.redirect(url)
  }

  // If the path is login and there's a valid token, redirect to home
  if (path === "/login" && token) {
    console.log(`Redirecting to home from login with valid token`)

    // Token exists, redirect to home
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  console.log(`Proceeding with request to: ${path}`)
  return NextResponse.next()
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
