"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  router: any
}

export function ProtectedRoute({ children, router }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const { user, loading } = useAuth()

  useEffect(() => {
    // Only redirect if auth check is complete and user is not authenticated
    if (!loading && !user) {
      router.push("/login")
    } else if (!loading) {
      // Auth check complete and user is authenticated
      setIsLoading(false)
    }
  }, [user, loading, router])

  if (loading || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
