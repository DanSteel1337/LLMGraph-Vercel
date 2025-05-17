"use client"

import type { ReactNode } from "react"
import { ProtectedRoute } from "@/lib/auth-simple"

interface ProtectedPageWrapperProps {
  children: ReactNode
}

export function ProtectedPageWrapper({ children }: ProtectedPageWrapperProps) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
