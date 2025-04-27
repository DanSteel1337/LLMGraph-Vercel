"use client"

import { useSearchParams } from "next/navigation"
import { LoginForm } from "./login-form"

export function LoginFormContainer() {
  // Get the redirect path from the URL query parameters
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get("redirect") || "/"

  return <LoginForm redirectPath={redirectPath} />
}
