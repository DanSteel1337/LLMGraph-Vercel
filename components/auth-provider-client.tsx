"use client"

import { Suspense, useState, useEffect, type ReactNode } from "react"
import dynamic from "next/dynamic"

// Import the AuthProvider with no SSR
const AuthProvider = dynamic(() => import("@/lib/auth"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
    </div>
  ),
})

export function AuthProviderClient({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  // This ensures we only render on the client
  useEffect(() => {
    setIsClient(true)
    console.log("AuthProviderClient mounted on client")
  }, [])

  if (!isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      }
    >
      <AuthProvider>{children}</AuthProvider>
    </Suspense>
  )
}
