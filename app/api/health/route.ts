import { NextResponse } from "next/server"
import { getPineconeStats, checkOpenAIHealth } from "@/lib/ai-sdk"
import { getApiSupabaseClient, withRetry } from "@/lib/supabase/api-client"

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

  // Check database connection with retry mechanism
  try {
    const supabase = getApiSupabaseClient()

    // Use withRetry to handle transient connection issues
    await withRetry(async () => {
      const { data, error } = await supabase.from("documents").select("id").limit(1)

      if (error) {
        console.error("Database health check error:", error)
        throw error
      }

      return data
    })

    // If we get here, the database connection is healthy
    healthStatus.database.status = "healthy"
    healthStatus.database.message = "Database connection is established and working"
  } catch (error) {
    console.error("Database health check failed after retries:", error)
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
    console.error("Pinecone health check failed:", error)
    healthStatus.pinecone.status = "unhealthy"
    healthStatus.pinecone.message = `Pinecone connection failed: ${error instanceof Error ? error.message : String(error)}`
    healthStatus.status = "degraded"
  }

  // Check OpenAI connection with our improved function
  const openAIHealth = await checkOpenAIHealth()
  healthStatus.openai = openAIHealth

  if (openAIHealth.status === "unhealthy") {
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
