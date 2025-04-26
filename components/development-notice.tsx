"use client"

import { useState } from "react"
import { AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function DevelopmentNotice() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) {
    return null
  }

  const isDevelopment = process.env.NODE_ENV !== "production"
  const isPreview = typeof window !== "undefined" && window.location.hostname.includes("vercel.app")

  if (!isDevelopment && !isPreview) {
    return null
  }

  return (
    <Alert variant="warning" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle>Development Mode</AlertTitle>
        <AlertDescription>
          You are viewing this application in {isDevelopment ? "development" : "preview"} mode. The application is using
          mock data since the backend server is not connected.
        </AlertDescription>
      </div>
      <Button variant="ghost" size="icon" onClick={() => setDismissed(true)}>
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </Alert>
  )
}
