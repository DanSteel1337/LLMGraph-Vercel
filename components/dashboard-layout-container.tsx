"use client"

import type React from "react"

import { usePathname, useRouter } from "next/navigation"
import { DashboardLayout } from "./dashboard-layout"

export function DashboardLayoutContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // Don't render the dashboard layout on the login page
  if (pathname === "/login") {
    return <>{children}</>
  }

  return (
    <DashboardLayout pathname={pathname} router={router}>
      {children}
    </DashboardLayout>
  )
}
