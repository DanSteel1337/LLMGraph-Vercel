import { NextResponse } from "next/server"
import { getPineconeStats, checkOpenAIHealth } from "@/lib/ai-sdk"
import { createClient } from "@supabase/supabase-js"

// Use edge runtime for better serverless compatibility
export const runtime = "nodejs"

// Create a fresh Supabase client for each request (no singleton)
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Check required environment variables
function checkRequiredEnvVars() {
  const requiredVars = [
    { name: "SUPABASE_URL", value: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL },
    {
      name: "SUPABASE_SERVICE_ROLE_KEY",
      value: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    { name: "PINECONE_API_KEY", value: process.env.PINECONE_API_KEY },
    { name: "PINECONE_INDEX_NAME", value: process.env.PINECONE_INDEX_NAME },
    { name: "OPENAI_API_KEY", value: process.env.OPENAI_API_KEY },
  ]

  const missingVars = requiredVars.filter((v) => !v.value).map((v) => v.name)
  return {
    allPresent: missingVars.length === 0,
    missingVars,
  }
}

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

    // Check database connection
    try {
      console.log("Checking database connection")
      const supabase = getSupabaseClient()

      // Simple query to check connection
      const { data, error } = await supabase.from("documents").select("id").limit(1)

      if (error) {
        console.error("Database health check error:", error)
        throw error
      }

      // If we get here, the database connection is healthy
      healthStatus.database.status = "healthy"
      healthStatus.database.message = "Database connection is established and working"
      healthStatus.debug.info.push("Database connection successful")
    } catch (error) {
      console.error("Database health check failed:", error)
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

    // Check OpenAI connection
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
