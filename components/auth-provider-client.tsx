"use client"

import { Suspense, type ReactNode } from "react"
import dynamic from "next/dynamic"

// Import the AuthProvider with no SSR
const AuthProvider = dynamic(() => import("@/lib/auth"), {
  ssr: false,
  loading: () => <div>Loading auth...</div>,
})

export function AuthProviderClient({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading auth...</div>}>
      <AuthProvider>{children}</AuthProvider>
    </Suspense>
  )
}
