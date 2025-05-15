"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ServiceStatus {
  status: "ok" | "error" | "warning"
  message: string
}

interface HealthCheckResponse {
  status: "ok" | "error" | "warning"
  timestamp: string
  services: {
    database: ServiceStatus
    // Add other services as needed
  }
}

export default function SystemStatus() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealthStatus = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/health")

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setHealth(data)
    } catch (err) {
      console.error("Error fetching health status:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthStatus()
  }, [])

  const getStatusIcon = (status: "ok" | "error" | "warning") => {
    switch (status) {
      case "ok":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Current status of system components</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : health ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Overall Status</div>
              <div className="flex items-center gap-2">
                {getStatusIcon(health.status)}
                <span>{health.status === "ok" ? "Healthy" : "Issues Detected"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Services</div>

              <div className="rounded-md border p-2">
                <div className="flex items-center justify-between">
                  <div>Database</div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(health.services.database.status)}
                    <span className="text-sm">{health.services.database.message}</span>
                  </div>
                </div>
              </div>

              {/* Add other services as needed */}
            </div>

            <div className="text-xs text-gray-500">Last updated: {new Date(health.timestamp).toLocaleString()}</div>
          </div>
        ) : (
          <Alert>
            <AlertTitle>No Data</AlertTitle>
            <AlertDescription>Unable to retrieve system status.</AlertDescription>
          </Alert>
        )}

        <div className="mt-4">
          <Button onClick={fetchHealthStatus} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh Status"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
