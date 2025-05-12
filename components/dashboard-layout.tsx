"use client"

import type React from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ErrorBoundary } from "@/components/error-boundary"

interface DashboardLayoutProps {
  children: React.ReactNode
  pathname: string
  router: any
}

export function DashboardLayout({ children, pathname, router }: DashboardLayoutProps) {
  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </ErrorBoundary>
  )
}
