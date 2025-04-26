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

  return (
    <Alert variant="warning" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle>Development Mode</AlertTitle>
        <AlertDescription>
          This application is running in development mode with mock data.
          <br />
          <span className="text-xs mt-1 block">
            Connect to a backend API by setting the NEXT_PUBLIC_API_URL environment variable.
          </span>
        </AlertDescription>
      </div>
      <Button variant="ghost" size="icon" onClick={() => setDismissed(true)}>
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </Alert>
  )
}
