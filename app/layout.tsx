import type React from "react"
import { Suspense } from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth"
import { DashboardLayoutContainer } from "@/components/dashboard-layout-container"

const inter = Inter({ subsets: ["latin"] })

// Simple loading component for the dashboard layout
function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="h-16 border-b bg-background px-4 flex items-center">
        <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
        <div className="ml-auto h-8 w-20 bg-muted rounded animate-pulse"></div>
      </header>
      <div className="flex flex-1">
        <main className="flex-1 p-4">
          <div className="h-full w-full flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <Suspense fallback={<DashboardLayoutSkeleton />}>
              <DashboardLayoutContainer>{children}</DashboardLayoutContainer>
            </Suspense>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
