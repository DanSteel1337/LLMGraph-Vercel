"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (authLoading) {
        console.log("Auth still loading after timeout, proceeding anyway")
        setIsLoading(false)
      }
    }, 3000)

    if (!authLoading) {
      console.log("Auth loaded, user:", user ? "exists" : "not found")
      if (!user) {
        console.log("No user found, redirecting to login")
        router.push("/login")
      } else {
        console.log("User found, rendering protected content")
        setIsLoading(false)
      }
    }

    return () => clearTimeout(timeoutId)
  }, [user, authLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
