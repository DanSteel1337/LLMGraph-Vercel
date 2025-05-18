"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase/provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ProtectedPageWrapperProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export function ProtectedPageWrapper({ children, adminOnly = false }: ProtectedPageWrapperProps) {
  const { user, loading, isAdmin } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname))
    } else if (!loading && adminOnly && !isAdmin) {
      router.push("/dashboard")
    }
  }, [user, loading, adminOnly, isAdmin, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  if (adminOnly && !isAdmin) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}
