import { NextResponse } from "next/server"
import { getPineconeStats } from "@/lib/ai-sdk"
import { supabaseClient } from "@/lib/supabase/client"
import { embed } from "ai"
import { openai } from "@ai-sdk/openai"

export async function GET() {
  const healthStatus = {
    status: "healthy",
    api: {
      status: "healthy",
      message: "API is operational",
    },
    database: {
      status: "healthy",
      message: "Database connection is established",
    },
    pinecone: {
      status: "healthy",
      message: "Pinecone connection is established",
    },
    openai: {
      status: "healthy",
      message: "OpenAI connection is established",
    },
    timestamp: new Date().toISOString(),
  }

  // Check database connection
  try {
    const { data, error } = await supabaseClient.from("documents").select("id").limit(1)

    if (error) {
      healthStatus.database.status = "unhealthy"
      healthStatus.database.message = `Database error: ${error.message}`
      healthStatus.status = "degraded"
    }
  } catch (error) {
    healthStatus.database.status = "unhealthy"
    healthStatus.database.message = `Database connection failed: ${error instanceof Error ? error.message : String(error)}`
    healthStatus.status = "degraded"
  }

  // Check Pinecone connection
  try {
    const pineconeStats = await getPineconeStats()

    if (pineconeStats.vectorCount === 0 && pineconeStats.dimensions === 0) {
      healthStatus.pinecone.status = "degraded"
      healthStatus.pinecone.message = "Pinecone connection established but no vectors found"
      healthStatus.status = "degraded"
    }
  } catch (error) {
    healthStatus.pinecone.status = "unhealthy"
    healthStatus.pinecone.message = `Pinecone connection failed: ${error instanceof Error ? error.message : String(error)}`
    healthStatus.status = "degraded"
  }

  // Check OpenAI connection
  try {
    // Test embedding generation
    await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: "Test embedding generation",
    })
  } catch (error) {
    healthStatus.openai.status = "unhealthy"
    healthStatus.openai.message = `OpenAI connection failed: ${error instanceof Error ? error.message : String(error)}`
    healthStatus.status = "degraded"
  }

  // If any component is unhealthy, mark the overall status as unhealthy
  if (
    healthStatus.database.status === "unhealthy" ||
    healthStatus.pinecone.status === "unhealthy" ||
    healthStatus.openai.status === "unhealthy"
  ) {
    healthStatus.status = "unhealthy"
  }

  return NextResponse.json(healthStatus)
}
