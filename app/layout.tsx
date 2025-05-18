import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { NavigationProvider } from "@/contexts/navigation-context"
import { SupabaseProvider } from "@/lib/supabase/provider" // ✅ Correct import
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Unreal Engine Documentation",
  description: "Search and explore Unreal Engine documentation with AI-powered search",
    generator: 'v0.dev'
}

// Disable static generation for this layout
export const dynamic = "force-dynamic"
export const revalidate = 0

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>
          <NavigationProvider>{children}</NavigationProvider>
          <Toaster />
        </SupabaseProvider>
      </body>
    </html>
  )
}
