"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient, shouldUseMockData } from "@/lib"

// Inline mock data for development and fallback
const mockSystemStatus = {
  status: "ok",
  timestamp: new Date().toISOString(),
  services: {
    database: { status: "ok", message: "Connected" },
    pinecone: { status: "ok", message: "Operational" },
  },
  isMockData: true,
}

interface ServiceStatus {
  status: "ok" | "error" | "warning"
  message: string
}

interface HealthCheckResponse {
  status: "ok" | "error" | "warning"
  timestamp: string
  services: {
    database: ServiceStatus
    pinecone?: ServiceStatus
    // Add other services as needed
  }
  isMockData?: boolean
}

function SystemStatus() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealthStatus = async () => {
    setLoading(true)
    setError(null)

    try {
      // Use the API client to fetch health status
      const response = await apiClient.get<HealthCheckResponse>("/api/system", {
        params: { type: "health" },
      })

      if (response.error) {
        throw new Error(`Health check failed: ${response.error}`)
      }

      // Handle different response formats
      const healthData = response.data

      // Validate the health data structure
      if (!healthData || !healthData.services) {
        throw new Error("Invalid health data format received")
      }

      setHealth(healthData)
    } catch (err) {
      console.error("Error fetching health status:", err)
      setError(err instanceof Error ? err.message : "Unknown error")

      // Use mock data as fallback in development or preview
      if (shouldUseMockData()) {
        console.info("Using mock health data as fallback")
        setHealth(mockSystemStatus)
      }
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

  // If we're in a preview environment and have an error, use mock data
  useEffect(() => {
    if (error && shouldUseMockData() && !health) {
      setHealth(mockSystemStatus)
    }
  }, [error, health])

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Current status of system components</CardDescription>
        {health?.isMockData && (
          <div className="mt-1 text-xs text-amber-500">Using mock data. Connect to real services for live status.</div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        ) : error && !health ? (
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

              {health.services.database && (
                <div className="rounded-md border p-2">
                  <div className="flex items-center justify-between">
                    <div>Database</div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(health.services.database.status)}
                      <span className="text-sm">{health.services.database.message}</span>
                    </div>
                  </div>
                </div>
              )}

              {health.services.pinecone && (
                <div className="rounded-md border p-2">
                  <div className="flex items-center justify-between">
                    <div>Pinecone</div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(health.services.pinecone.status)}
                      <span className="text-sm">{health.services.pinecone.message}</span>
                    </div>
                  </div>
                </div>
              )}
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

// Add named export
export { SystemStatus }

// Keep default export for backward compatibility
export default SystemStatus
