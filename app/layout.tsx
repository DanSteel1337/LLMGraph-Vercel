import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProviderClient } from "@/components/auth-provider-client"

// Configure font with display: swap for better performance
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // This helps with font loading performance
  preload: true,
})

export const metadata = {
  title: "UE RAG Dashboard",
  description: "A dashboard for managing RAG documents and search",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to font domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProviderClient>{children}</AuthProviderClient>
        </ThemeProvider>
      </body>
    </html>
  )
}
