"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { checkHealth } from "@/lib/api"

interface SystemStatus {
  status: "healthy" | "unhealthy" | "degraded"
  components: {
    name: string
    status: "healthy" | "unhealthy" | "degraded"
    message?: string
  }[]
  lastChecked: string
}

export function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const healthData = await checkHealth()

        // Transform health data into system status
        const systemStatus: SystemStatus = {
          status: healthData.status || "unhealthy",
          components: [
            {
              name: "API Server",
              status: healthData.api?.status || "unhealthy",
              message: healthData.api?.message,
            },
            {
              name: "Database",
              status: healthData.database?.status || "unhealthy",
              message: healthData.database?.message,
            },
            {
              name: "Pinecone",
              status: healthData.pinecone?.status || "unhealthy",
              message: healthData.pinecone?.message,
            },
            {
              name: "OpenAI",
              status: healthData.openai?.status || "unhealthy",
              message: healthData.openai?.message,
            },
          ],
          lastChecked: new Date().toISOString(),
        }

        setStatus(systemStatus)
      } catch (error) {
        console.error("Error fetching system status:", error)
        setError("Failed to fetch system status")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSystemStatus()

    // Refresh status every 5 minutes
    const interval = setInterval(fetchSystemStatus, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">System Status</CardTitle>
        {!isLoading && !error && status && (
          <Badge
            variant={status.status === "healthy" ? "success" : status.status === "degraded" ? "warning" : "destructive"}
          >
            {status.status === "healthy"
              ? "All Systems Operational"
              : status.status === "degraded"
                ? "Degraded Performance"
                : "System Issues Detected"}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-2 text-sm text-red-500">{error}</div>
        ) : status ? (
          <div className="space-y-2">
            {status.components.map((component) => (
              <div key={component.name} className="flex items-center justify-between">
                <span className="text-sm">{component.name}</span>
                <div className="flex items-center gap-1">
                  {component.status === "healthy" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : component.status === "degraded" ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-xs ${
                      component.status === "healthy"
                        ? "text-green-500"
                        : component.status === "degraded"
                          ? "text-yellow-500"
                          : "text-red-500"
                    }`}
                  >
                    {component.status}
                  </span>
                </div>
              </div>
            ))}
            <div className="text-xs text-muted-foreground text-right mt-2">
              Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-sm text-muted-foreground">No status data available</div>
        )}
      </CardContent>
    </Card>
  )
}
