"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(false)
  const router = useRouter()
  const { signIn, isLoading } = useAuth()
  const { toast } = useToast()

  // Check if auth is initialized
  useEffect(() => {
    if (!isLoading) {
      setAuthInitialized(true)
    }
  }, [isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!authInitialized) {
      toast({
        variant: "destructive",
        title: "Authentication not ready",
        description: "Please wait for authentication to initialize and try again.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log("Attempting login with:", email)
      const { success, error } = await signIn(email, password)

      if (success) {
        console.log("Login successful")
        toast({
          title: "Login successful",
          description: "You have been logged in successfully.",
        })
        router.push("/")
      } else {
        console.log("Login failed:", error)
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error || "Please check your credentials and try again.",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Initializing authentication...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting || !authInitialized}>
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>

      {!authInitialized && (
        <p className="text-sm text-amber-500 text-center">Authentication is initializing. Please wait...</p>
      )}
    </form>
  )
}
