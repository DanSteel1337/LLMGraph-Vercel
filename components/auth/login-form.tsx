"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ErrorBoundary } from "@/components/error-boundary"
import { useAuth } from "@/lib/auth-context"

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const searchParams = useSearchParams()
  const redirect = searchParams?.get("redirect") || "/"

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    if (!password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)
      console.log("Login attempt with:", email)

      const { success, error } = await signIn(email, password)

      if (!success) {
        console.error("Login error:", error)
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error || "Invalid email or password. Please try again.",
        })
        return
      }

      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      })

      // Redirect to the dashboard or requested page
      router.push(redirect)
      router.refresh()
    } catch (error) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="grid gap-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && <p className="text-sm font-medium text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password && <p className="text-sm font-medium text-destructive">{errors.password}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <p>Demo credentials:</p>
          <p>Email: demo@example.com</p>
          <p>Password: 123456abc</p>
        </div>
      </div>
    </ErrorBoundary>
  )
}
