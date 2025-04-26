import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

// This would be an environment variable in production
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // Verify the token
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      return NextResponse.json({ user: payload })
    } catch (error) {
      // Token is invalid or expired
      return NextResponse.json({ user: null }, { status: 401 })
    }
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ error: "An error occurred while authenticating" }, { status: 500 })
  }
}
