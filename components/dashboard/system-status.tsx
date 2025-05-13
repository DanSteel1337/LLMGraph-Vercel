"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { checkHealth } from "@/lib/api"
import { Button } from "@/components/ui/button"

interface SystemStatus {
  status: "healthy" | "unhealthy" | "degraded" | "unknown"
  components: {
    name: string
    status: "healthy" | "unhealthy" | "degraded" | "unknown"
    message?: string
  }[]
  lastChecked: string
}

export function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchSystemStatus = async () => {
    try {
      setIsRefreshing(true)
      setError(null)

      const healthData = await checkHealth()

      // Transform health data into system status
      const systemStatus: SystemStatus = {
        status: healthData.status || "unknown",
        components: [
          {
            name: "API Server",
            status: healthData.api?.status || "unknown",
            message: healthData.api?.message,
          },
          {
            name: "Database",
            status: healthData.database?.status || "unknown",
            message: healthData.database?.message,
          },
          {
            name: "Pinecone",
            status: healthData.pinecone?.status || "unknown",
            message: healthData.pinecone?.message,
          },
          {
            name: "OpenAI",
            status: healthData.openai?.status || "unknown",
            message: healthData.openai?.message,
          },
        ],
        lastChecked: healthData.timestamp || new Date().toISOString(),
      }

      setStatus(systemStatus)
    } catch (error) {
      console.error("Error fetching system status:", error)
      setError("Failed to fetch system status")

      // Set a fallback status when the health check fails completely
      setStatus({
        status: "unknown",
        components: [
          { name: "API Server", status: "unknown" },
          { name: "Database", status: "unknown" },
          { name: "Pinecone", status: "unknown" },
          { name: "OpenAI", status: "unknown" },
        ],
        lastChecked: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSystemStatus()

    // Refresh status every 5 minutes
    const interval = setInterval(fetchSystemStatus, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "healthy":
        return "success"
      case "degraded":
        return "warning"
      case "unhealthy":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "healthy":
        return "All Systems Operational"
      case "degraded":
        return "Degraded Performance"
      case "unhealthy":
        return "System Issues Detected"
      default:
        return "Status Unknown"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "unhealthy":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">System Status</CardTitle>
        {!isLoading && !error && status && (
          <Badge variant={getStatusBadgeVariant(status.status)}>{getStatusText(status.status)}</Badge>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && !isRefreshing ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {error && !status && <div className="text-center py-2 text-sm text-red-500">{error}</div>}
            {status && (
              <div className="space-y-2">
                {status.components.map((component) => (
                  <div key={component.name} className="flex items-center justify-between">
                    <span className="text-sm">{component.name}</span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(component.status)}
                      <span
                        className={`text-xs ${
                          component.status === "healthy"
                            ? "text-green-500"
                            : component.status === "degraded"
                              ? "text-yellow-500"
                              : component.status === "unhealthy"
                                ? "text-red-500"
                                : "text-gray-500"
                        }`}
                      >
                        {component.status}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between mt-4 pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchSystemStatus}
                    disabled={isRefreshing}
                    className="h-7 px-2"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
