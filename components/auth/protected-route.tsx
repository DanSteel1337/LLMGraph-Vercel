"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  router: any
}

export function ProtectedRoute({ children, router }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const { user, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login")
      } else {
        setIsLoading(false)
      }
    }
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
