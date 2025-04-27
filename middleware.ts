import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login"

  // Get the token from the cookies
  const token = request.cookies.get("auth_token")?.value || request.headers.get("authorization")?.split(" ")[1]

  // For client-side auth, we'll rely on localStorage which the middleware can't access
  // So we'll just check if we're on a public path and there's a token in the cookie

  // If the path is login and there's a valid token, redirect to home
  if (isPublicPath && token) {
    // Token is valid, redirect to home
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
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
