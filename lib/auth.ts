"use client"

import { jwtDecode } from "jwt-decode"

// In a real application, you would use a proper authentication service
// This is a simple implementation for demonstration purposes

// Demo credentials - in a real app, these would be stored securely in a database
const DEMO_USERNAME = "admin"
const DEMO_PASSWORD = "password123"

// JWT token structure
interface JwtPayload {
  username: string
  exp: number
}

// Check if running in browser
const isBrowser = typeof window !== "undefined"

// Login function
export async function login(username: string, password: string): Promise<boolean> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Check credentials
  if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
    // Create a simple JWT token (in a real app, this would be done on the server)
    const token = createToken(username)

    // Store token in localStorage
    if (isBrowser) {
      localStorage.setItem("auth_token", token)
    }

    return true
  }

  return false
}

// Logout function
export function logout(): void {
  if (isBrowser) {
    localStorage.removeItem("auth_token")
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (!isBrowser) {
    return false
  }

  const token = localStorage.getItem("auth_token")

  if (!token) {
    return false
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token)

    // Check if token is expired
    if (decoded.exp < Date.now() / 1000) {
      localStorage.removeItem("auth_token")
      return false
    }

    return true
  } catch (error) {
    localStorage.removeItem("auth_token")
    return false
  }
}

// Get current user
export function getCurrentUser(): string | null {
  if (!isBrowser) {
    return null
  }

  const token = localStorage.getItem("auth_token")

  if (!token) {
    return null
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return decoded.username
  } catch (error) {
    return null
  }
}

// Create a simple JWT token (in a real app, this would be done on the server)
function createToken(username: string): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const payload = {
    username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
  }

  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(payload))

  // In a real app, you would use a proper JWT library and a secure secret
  const signature = btoa(`${encodedHeader}.${encodedPayload}`)

  return `${encodedHeader}.${encodedPayload}.${signature}`
}
