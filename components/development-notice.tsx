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
        <AlertTitle>Mock Data Mode</AlertTitle>
        <AlertDescription>
          This application is running with mock data. No backend connection is required.
          <br />
          <span className="text-xs mt-1 block">All data shown is simulated for demonstration purposes.</span>
        </AlertDescription>
      </div>
      <Button variant="ghost" size="icon" onClick={() => setDismissed(true)}>
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </Alert>
  )
}
