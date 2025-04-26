import { NextResponse } from "next/server"
import { getConnectionStatus } from "@/lib/backend-connection"

export async function GET() {
  const status = getConnectionStatus()

  // Try to connect to the backend if configured
  let backendStatus = "unavailable"
  let backendVersion = null

  if (status.hasBackend) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      if (response.ok) {
        backendStatus = "connected"
        try {
          const data = await response.json()
          backendVersion = data.version || "unknown"
        } catch (e) {
          backendVersion = "unknown format"
        }
      } else {
        backendStatus = `error: ${response.status}`
      }
    } catch (error) {
      backendStatus = `error: ${error instanceof Error ? error.message : String(error)}`
    }
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    connections: {
      ...status,
      backendStatus,
      backendVersion,
    },
  })
}
