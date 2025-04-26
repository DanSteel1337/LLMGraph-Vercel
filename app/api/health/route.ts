import { NextResponse } from "next/server"
import { getConnectionStatus } from "@/lib/backend-connection"

export async function GET() {
  const status = getConnectionStatus()

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    connections: status,
  })
}
