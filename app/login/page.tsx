"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Github, Mail } from "lucide-react"
import { useAuthState } from "@/hooks/use-auth-state"
import { apiClient } from "@/lib/api-client"
import { shouldUseMockData } from "@/lib/environment"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMockData, setIsMockData] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { session } = useAuthState()

  useEffect(() => {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      setIsMockData(true)
    }

    // Redirect if already logged in
    if (session) {
      router.push("/")
    }
  }, [session, router])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Handle mock data mode
      if (isMockData) {
        // Simulate login delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast({
          title: "Magic link sent (Mock)",
          description: "Check your email for a login link",
        })

        // Simulate successful login after a delay
        setTimeout(() => {
          router.push("/")
        }, 2000)

        return
      }

      // Real login flow
      const response = await apiClient.post("/auth/magic-link", { email })

      if (!response.ok) {
        throw new Error("Failed to send magic link")
      }

      toast({
        title: "Magic link sent",
        description: "Check your email for a login link",
      })
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    setIsLoading(true)

    try {
      // Handle mock data mode
      if (isMockData) {
        // Simulate login delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast({
          title: "GitHub login successful (Mock)",
          description: "You are now logged in",
        })

        // Simulate successful login after a delay
        setTimeout(() => {
          router.push("/")
        }, 1000)

        return
      }

      // Real GitHub login flow
      const response = await apiClient.get("/auth/github")

      if (!response.ok) {
        throw new Error("Failed to initiate GitHub login")
      }

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No redirect URL provided")
      }
    } catch (error) {
      console.error("GitHub login error:", error)
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your email to receive a magic link</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Send Magic Link
              </Button>
              <Button onClick={handleGithubLogin} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
                Login with GitHub
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>{/* Additional footer content can be added here */}</CardFooter>
      </Card>
    </div>
  )
}
