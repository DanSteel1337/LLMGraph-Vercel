import { NextResponse } from "next/server"
import { getPineconeStats, checkOpenAIHealth } from "@/lib/ai-sdk"
import { getApiSupabaseClient, withRetry } from "@/lib/supabase/api-client"
import { checkRequiredEnvVars } from "@/lib/env-check"

export const runtime = "nodejs" // Change from edge to nodejs for better stability

export async function GET() {
  console.log("Health check API called")

  // Initialize health status with default values
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
    debug: {
      errors: [] as string[],
      warnings: [] as string[],
      info: [] as string[],
    },
  }

  try {
    // Check environment variables first
    const envCheck = checkRequiredEnvVars()
    if (!envCheck.allPresent) {
      healthStatus.debug.errors.push(`Missing environment variables: ${envCheck.missingVars.join(", ")}`)

      // Update specific service statuses based on missing env vars
      if (envCheck.missingVars.some((v) => v.includes("SUPABASE"))) {
        healthStatus.database.status = "unhealthy"
        healthStatus.database.message = "Missing Supabase environment variables"
      }

      if (envCheck.missingVars.some((v) => v.includes("PINECONE"))) {
        healthStatus.pinecone.status = "unhealthy"
        healthStatus.pinecone.message = "Missing Pinecone environment variables"
      }

      if (envCheck.missingVars.some((v) => v.includes("OPENAI"))) {
        healthStatus.openai.status = "unhealthy"
        healthStatus.openai.message = "Missing OpenAI environment variables"
      }
    } else {
      healthStatus.debug.info.push("All required environment variables are set")
    }

    // Check database connection with retry mechanism
    try {
      console.log("Checking database connection")
      const supabase = getApiSupabaseClient()

      // Use withRetry to handle transient connection issues
      await withRetry(
        async () => {
          const { data, error } = await supabase.from("documents").select("id").limit(1)

          if (error) {
            console.error("Database health check error:", error)
            throw error
          }

          return data
        },
        3,
        1000,
      ) // 3 retries, 1 second delay

      // If we get here, the database connection is healthy
      healthStatus.database.status = "healthy"
      healthStatus.database.message = "Database connection is established and working"
      healthStatus.debug.info.push("Database connection successful")
    } catch (error) {
      console.error("Database health check failed after retries:", error)
      healthStatus.database.status = "unhealthy"
      healthStatus.database.message = `Database connection failed: ${error instanceof Error ? error.message : String(error)}`
      healthStatus.status = "degraded"
      healthStatus.debug.errors.push(`Database error: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Check Pinecone connection
    try {
      console.log("Checking Pinecone connection")
      const pineconeStats = await getPineconeStats()

      if (!pineconeStats) {
        healthStatus.pinecone.status = "unhealthy"
        healthStatus.pinecone.message = "Failed to get Pinecone stats"
        healthStatus.status = "degraded"
        healthStatus.debug.errors.push("Pinecone stats returned null or undefined")
      } else if (pineconeStats.vectorCount === 0 && pineconeStats.dimensions === 0) {
        healthStatus.pinecone.status = "degraded"
        healthStatus.pinecone.message = "Pinecone connection established but no vectors found"
        healthStatus.status = "degraded"
        healthStatus.debug.warnings.push("Pinecone has no vectors")
      } else {
        healthStatus.debug.info.push(
          `Pinecone stats: ${pineconeStats.vectorCount} vectors, ${pineconeStats.dimensions} dimensions`,
        )
      }
    } catch (error) {
      console.error("Pinecone health check failed:", error)
      healthStatus.pinecone.status = "unhealthy"
      healthStatus.pinecone.message = `Pinecone connection failed: ${error instanceof Error ? error.message : String(error)}`
      healthStatus.status = "degraded"
      healthStatus.debug.errors.push(`Pinecone error: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Check OpenAI connection with our improved function
    try {
      console.log("Checking OpenAI connection")
      const openAIHealth = await checkOpenAIHealth()
      healthStatus.openai = openAIHealth

      if (openAIHealth.status === "unhealthy") {
        healthStatus.status = "degraded"
        healthStatus.debug.errors.push(`OpenAI error: ${openAIHealth.message}`)
      } else {
        healthStatus.debug.info.push("OpenAI connection successful")
      }
    } catch (error) {
      console.error("OpenAI health check failed:", error)
      healthStatus.openai.status = "unhealthy"
      healthStatus.openai.message = `OpenAI connection failed: ${error instanceof Error ? error.message : String(error)}`
      healthStatus.status = "degraded"
      healthStatus.debug.errors.push(`OpenAI error: ${error instanceof Error ? error.message : String(error)}`)
    }

    // If any component is unhealthy, mark the overall status as unhealthy
    if (
      healthStatus.database.status === "unhealthy" ||
      healthStatus.pinecone.status === "unhealthy" ||
      healthStatus.openai.status === "unhealthy"
    ) {
      healthStatus.status = "unhealthy"
    }

    console.log("Health check completed with status:", healthStatus.status)
    return NextResponse.json(healthStatus)
  } catch (error) {
    // Catch any unexpected errors in the overall health check process
    console.error("Unexpected error in health check API:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        api: { status: "unhealthy", message: "API encountered an unexpected error" },
        database: { status: "unknown", message: "Could not check database status" },
        pinecone: { status: "unknown", message: "Could not check Pinecone status" },
        openai: { status: "unknown", message: "Could not check OpenAI status" },
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        debug: {
          errors: [`Unexpected error: ${error instanceof Error ? error.message : String(error)}`],
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 200 },
    ) // Return 200 even for errors to avoid cascading failures
  }
}
