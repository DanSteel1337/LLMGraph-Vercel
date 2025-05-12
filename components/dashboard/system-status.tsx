"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertCircle, Server, Database, Brain } from "lucide-react"
import { testBackendConnection } from "@/lib/backend-connection"

interface ConnectionStatus {
  connected: boolean
  pineconeStatus?: string
  openaiStatus?: string
  error?: string
}

export function SystemStatus() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setIsLoading(true)
        const connectionStatus = await testBackendConnection()
        setStatus(connectionStatus)
      } catch (error) {
        console.error("Failed to check connection status:", error)
        setStatus({
          connected: false,
          error: "Failed to check connection status",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkStatus()

    // Check status every 5 minutes
    const interval = setInterval(checkStatus, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          System Status
        </CardTitle>
        <CardDescription>Current status of system components</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-6 w-full animate-pulse rounded-md bg-muted"></div>
            <div className="h-6 w-full animate-pulse rounded-md bg-muted"></div>
            <div className="h-6 w-full animate-pulse rounded-md bg-muted"></div>
          </div>
        ) : status ? (
          <div className="space-y-4">
            <StatusItem
              title="API Server"
              status={status.connected ? "online" : "offline"}
              icon={Server}
              message={status.connected ? "Connected" : status.error || "Not connected"}
            />
            <StatusItem
              title="Vector Database"
              status={getPineconeStatus(status.pineconeStatus)}
              icon={Database}
              message={getPineconeMessage(status.pineconeStatus)}
            />
            <StatusItem
              title="AI Embeddings"
              status={getOpenAIStatus(status.openaiStatus)}
              icon={Brain}
              message={getOpenAIMessage(status.openaiStatus)}
            />
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Unable to fetch system status</div>
        )}
      </CardContent>
    </Card>
  )
}

interface StatusItemProps {
  title: string
  status: "online" | "offline" | "warning"
  icon: React.ElementType
  message: string
}

function StatusItem({ title, status, icon: Icon, message }: StatusItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{message}</span>
        {status === "online" && <CheckCircle className="h-5 w-5 text-green-500" />}
        {status === "offline" && <XCircle className="h-5 w-5 text-red-500" />}
        {status === "warning" && <AlertCircle className="h-5 w-5 text-yellow-500" />}
      </div>
    </div>
  )
}

// Helper functions to determine status and messages
function getPineconeStatus(status?: string): "online" | "offline" | "warning" {
  if (!status) return "offline"
  if (status === "configured") return "online"
  if (status === "error") return "offline"
  return "warning"
}

function getPineconeMessage(status?: string): string {
  if (!status) return "Not configured"
  if (status === "configured") return "Connected"
  if (status === "error") return "Connection error"
  return "Unknown status"
}

function getOpenAIStatus(status?: string): "online" | "offline" | "warning" {
  if (!status) return "offline"
  if (status === "configured") return "online"
  if (status === "error") return "offline"
  return "warning"
}

function getOpenAIMessage(status?: string): string {
  if (!status) return "Not configured"
  if (status === "configured") return "Connected"
  if (status === "error") return "Connection error"
  return "Unknown status"
}
