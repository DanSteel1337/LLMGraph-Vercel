"use client"

import { LoginForm } from "./login-form"

interface LoginFormWrapperProps {
  redirectPath: string
}

export function LoginFormWrapper({ redirectPath }: LoginFormWrapperProps) {
  return <LoginForm redirectPath={redirectPath} />
}
