import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// This would be an environment variable in production
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login"

  // Get the token from the cookies
  const token = request.cookies.get("auth_token")?.value

  // If the path is not public and there's no token, redirect to login
  if (!isPublicPath && !token) {
    // Create a new URL for the login page
    const url = request.nextUrl.clone()
    url.pathname = "/login"

    // Add the original URL as a parameter to redirect after login
    url.search = `?redirect=${path}`

    return NextResponse.redirect(url)
  }

  // If the path is not public and there's a token, verify it
  if (!isPublicPath && token) {
    try {
      // Verify the token
      await jwtVerify(token, JWT_SECRET)
      // Token is valid, continue
      return NextResponse.next()
    } catch (error) {
      // Token is invalid or expired, redirect to login
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.search = `?redirect=${path}`
      return NextResponse.redirect(url)
    }
  }

  // If the path is login and there's a valid token, redirect to home
  if (isPublicPath && token) {
    try {
      // Verify the token
      await jwtVerify(token, JWT_SECRET)
      // Token is valid, redirect to home
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    } catch (error) {
      // Token is invalid or expired, continue to login
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
