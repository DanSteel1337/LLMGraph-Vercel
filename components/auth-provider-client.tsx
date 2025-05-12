"use client"

import type { ReactNode } from "react"
import dynamic from "next/dynamic"

// Dynamically import the AuthProvider with no SSR
const AuthProviderNoSSR = dynamic(() => import("@/lib/auth").then((mod) => mod.AuthProvider), { ssr: false })

export function AuthProviderClient({ children }: { children: ReactNode }) {
  return <AuthProviderNoSSR>{children}</AuthProviderNoSSR>
}
