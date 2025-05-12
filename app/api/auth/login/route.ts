import { type NextRequest, NextResponse } from "next/server"
import { SignJWT } from "jose"
import { cookies } from "next/headers"

// In a real application, these would be stored in a database
// and passwords would be hashed
const USERS = [
  {
    id: "1",
    username: "123456abc",
    // In production, this would be a hashed password
    password: "123456abc",
    name: "Admin User",
    role: "admin",
  },
]

// This would be an environment variable in production
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Find user
    const user = USERS.find((u) => u.username === username && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create a JWT token
    const token = await new SignJWT({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(JWT_SECRET)

    // Set HTTP-only cookie
    const cookieStore = cookies()
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "strict",
    })

    // Return user info (without password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}
