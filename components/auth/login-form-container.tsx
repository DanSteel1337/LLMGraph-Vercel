"use client"

import { useSearchParams } from "next/navigation"
import { LoginFormWrapper } from "./login-form-wrapper"

export function LoginFormContainer() {
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get("redirect") || "/"

  return <LoginFormWrapper redirectPath={redirectPath} />
}
