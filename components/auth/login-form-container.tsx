"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { LoginForm } from "./login-form"

export function LoginFormContainer() {
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get("redirect") || "/"

  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <LoginForm redirectPath={redirectPath} />
    </Suspense>
  )
}
