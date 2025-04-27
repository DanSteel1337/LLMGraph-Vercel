"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { ProtectedRoute } from "./protected-route"

export function ProtectedRouteContainer({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return <ProtectedRoute router={router}>{children}</ProtectedRoute>
}
