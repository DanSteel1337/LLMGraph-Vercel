"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { shouldUseMockData } from "@/lib/environment"

interface User {
  id: string
  email: string
  name?: string
  role?: string
}

interface Session {
  user: User
  expires_at?: number
}

interface AuthState {
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  error: Error | null
}

// Mock data for development
const MOCK_SESSION: Session = {
  user: {
    id: "mock-user-id",
    email: "mock-user@example.com",
    name: "Mock User",
    role: "admin",
  },
  expires_at: Date.now() + 86400000, // 24 hours from now
}

export function useAuthState(): AuthState {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchSession() {
      try {
        setIsLoading(true)

        // Check if we should use mock data
        if (shouldUseMockData()) {
          setSession(MOCK_SESSION)
          setIsAdmin(true)
          return
        }

        // Fetch session from API
        const response = await apiClient.get("/auth?type=session")

        if (!response.ok) {
          throw new Error("Failed to fetch session")
        }

        const data = await response.json()

        if (data.session) {
          setSession(data.session)

          // Check if user is admin
          const adminResponse = await apiClient.get("/auth?type=admin")

          if (adminResponse.ok) {
            const adminData = await adminResponse.json()
            setIsAdmin(adminData.isAdmin)
          }
        }
      } catch (err) {
        console.error("Error fetching auth state:", err)
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [])

  return { session, isLoading, isAdmin, error }
}
