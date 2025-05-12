import { NextResponse } from "next/server"
import { getConnectionStatus } from "@/lib/backend-connection"

export async function GET() {
  const status = getConnectionStatus()

  // Check Pinecone connection
  let pineconeStatus = "not_configured"
  if (status.hasPinecone) {
    try {
      // We would test the Pinecone connection here
      // For now, we'll just report that it's configured
      pineconeStatus = "configured"
    } catch (error) {
      pineconeStatus = "error"
    }
  }

  // Check OpenAI connection
  let openaiStatus = "not_configured"
  if (status.hasOpenAI) {
    try {
      // We would test the OpenAI connection here
      // For now, we'll just report that it's configured
      openaiStatus = "configured"
    } catch (error) {
      openaiStatus = "error"
    }
  }

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    connections: {
      pinecone: pineconeStatus,
      openai: openaiStatus,
    },
  })
}
