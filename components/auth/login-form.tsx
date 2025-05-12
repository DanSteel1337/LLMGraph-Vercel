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

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({})
  const searchParams = useSearchParams()
  const redirect = searchParams?.get("redirect") || "/"

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {}

    if (!username) {
      newErrors.username = "Username is required"
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
      console.log("Login attempt with:", username)

      // Simple login for demo purposes
      if (username === "123456abc" && password === "123456abc") {
        console.log("Login successful, setting token")

        // Create a simple token and store it in cookies
        const token = "demo-token-" + Math.random().toString(36).substring(2, 15)
        document.cookie = `auth_token=${token}; path=/; max-age=86400`

        // Also store in localStorage as a backup
        localStorage.setItem("auth_token", token)

        toast({
          title: "Login successful",
          description: "You have been logged in successfully.",
        })

        console.log("Redirecting to:", redirect)

        // Redirect to the requested page or dashboard
        setTimeout(() => {
          router.push(redirect)
          router.refresh()
        }, 100)
      } else {
        console.log("Login failed: Invalid credentials")

        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid username or password. Try using 123456abc for both.",
        })
      }
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
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoComplete="username"
            />
            {errors.username && <p className="text-sm font-medium text-destructive">{errors.username}</p>}
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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Demo Credentials</span>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Username: 123456abc</p>
          <p>Password: 123456abc</p>
        </div>
      </div>
    </ErrorBoundary>
  )
}
