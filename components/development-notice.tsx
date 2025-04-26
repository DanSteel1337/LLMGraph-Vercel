"use client"

import { useState, useEffect } from "react"
import { AlertCircle, X, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getConnectionStatus } from "@/lib/backend-connection"

export function DevelopmentNotice() {
  const [dismissed, setDismissed] = useState(false)
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/health")
        if (response.ok) {
          const data = await response.json()
          setHealthStatus(data)
        }
      } catch (error) {
        console.error("Failed to check health:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkHealth()
  }, [])

  const connectionStatus = getConnectionStatus()

  if (dismissed) {
    return null
  }

  return (
    <Alert variant="warning" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle>Development Mode</AlertTitle>
        <AlertDescription>
          <p>This application is running in development mode with mock data.</p>

          <div className="mt-2 space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span>Backend API:</span>
              <Badge variant={connectionStatus.hasBackend ? "outline" : "destructive"} className="text-xs">
                {connectionStatus.hasBackend ? connectionStatus.apiUrl : "Not configured"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span>Pinecone:</span>
              <Badge variant={connectionStatus.hasPinecone ? "outline" : "destructive"} className="text-xs">
                {connectionStatus.hasPinecone ? "Configured" : "Not configured"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span>Data Mode:</span>
              <Badge variant="secondary" className="text-xs">
                {connectionStatus.useMockData ? "Mock Data" : "Live Data"}
              </Badge>
            </div>
          </div>

          <div className="mt-2 text-xs">
            <Button variant="link" className="h-auto p-0 text-xs" onClick={() => window.open("/api/health", "_blank")}>
              View Health Status <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </AlertDescription>
      </div>
      <Button variant="ghost" size="icon" onClick={() => setDismissed(true)}>
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </Alert>
  )
}
