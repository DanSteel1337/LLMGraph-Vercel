"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useAuthState } from "@/hooks/use-auth-state"
import { shouldUseMockData } from "@/lib/environment"

interface ProtectedPageWrapperProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export function ProtectedPageWrapper({ children, adminOnly = false }: ProtectedPageWrapperProps) {
  const { session, isLoading, isAdmin } = useAuthState()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // If using mock data, always authorize
    if (shouldUseMockData()) {
      setIsAuthorized(true)
      return
    }

    // Wait until auth state is loaded
    if (isLoading) return

    // Check if user is logged in
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Check if admin access is required
    if (adminOnly && !isAdmin) {
      toast({
        title: "Access denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // User is authorized
    setIsAuthorized(true)
  }, [session, isLoading, isAdmin, adminOnly, router, toast])

  if (isLoading && !shouldUseMockData()) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthorized && !shouldUseMockData()) {
    return null
  }

  return <>{children}</>
}
