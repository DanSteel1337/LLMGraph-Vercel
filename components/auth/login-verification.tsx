"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function LoginVerification() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const checkLoginStatus = () => {
      const cookies = document.cookie.split(";").map((cookie) => cookie.trim())
      const authCookie = cookies.find((cookie) => cookie.startsWith("auth_token="))

      if (authCookie) {
        const token = authCookie.split("=")[1]
        setIsLoggedIn(true)
        setAuthToken(token)
      } else {
        setIsLoggedIn(false)
        setAuthToken(null)
      }
    }

    checkLoginStatus()
  }, [])

  const handleLogout = () => {
    // Clear the auth token cookie
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    // Update state
    setIsLoggedIn(false)
    setAuthToken(null)

    // Show toast
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })

    // Redirect to login page
    router.push("/login")
  }

  const handleLogin = () => {
    router.push("/login")
  }

  if (isLoggedIn === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Checking login status...</CardTitle>
          <CardDescription>Please wait while we verify your authentication status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Status</CardTitle>
        <CardDescription>Verification of your current login state</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium">Login Status:</div>
            <div className={isLoggedIn ? "text-green-600" : "text-red-600"}>
              {isLoggedIn ? "Logged In" : "Not Logged In"}
            </div>
          </div>

          {isLoggedIn && (
            <div className="grid grid-cols-2 gap-4">
              <div className="font-medium">Auth Token:</div>
              <div className="truncate max-w-[200px]">{authToken}</div>
            </div>
          )}

          <div className="bg-gray-100 p-4 rounded text-sm">
            <p className="font-medium mb-2">Expected behavior:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>When logged in, you should see your auth token</li>
              <li>Protected routes should be accessible</li>
              <li>Logging out should clear your token and redirect to login</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isLoggedIn ? (
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Button onClick={handleLogin}>Go to Login</Button>
        )}
        <Button variant="outline" onClick={() => router.push("/")}>
          Go to Dashboard
        </Button>
      </CardFooter>
    </Card>
  )
}
