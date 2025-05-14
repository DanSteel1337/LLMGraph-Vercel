import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use Node.js runtime since Pinecone requires Node.js modules
export const runtime = "nodejs"

// Create a fresh Supabase client for each request
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables")
    return null
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

// Simple function to check Pinecone connection without using problematic features
async function checkPineconeConnection() {
  try {
    // Only import Pinecone in the server environment
    const { Pinecone } = await import("@pinecone-database/pinecone")

    if (!process.env.PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY is not defined")
    }

    if (!process.env.PINECONE_INDEX_NAME) {
      throw new Error("PINECONE_INDEX_NAME is not defined")
    }

    // Create Pinecone client
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    })

    // Get index
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME)

    // Get stats (this doesn't use fs or path)
    const stats = await index.describeIndexStats()

    return {
      status: "healthy",
      message: "Pinecone connection established",
      stats: {
        vectorCount: stats.totalVectorCount,
        dimensions: stats.dimension || 0,
      },
    }
  } catch (error) {
    console.error("Pinecone health check failed:", error)
    return {
      status: "unhealthy",
      message: `Pinecone connection failed: ${error instanceof Error ? error.message : String(error)}`,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Simple function to check OpenAI connection
async function checkOpenAIConnection() {
  try {
    // Only import OpenAI in the server environment
    const { embed } = await import("ai")
    const { openai } = await import("@ai-sdk/openai")

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined")
    }

    // Test embedding with a simple string
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: "test",
    })

    return {
      status: "healthy",
      message: "OpenAI connection established",
      embeddingLength: embedding.length,
    }
  } catch (error) {
    console.error("OpenAI health check failed:", error)
    return {
      status: "unhealthy",
      message: `OpenAI connection failed: ${error instanceof Error ? error.message : String(error)}`,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function GET() {
  console.log("Health check API called")

  // Initialize health status with default values
  const healthStatus = {
    status: "checking",
    api: {
      status: "healthy",
      message: "API is operational",
    },
    database: {
      status: "unknown",
      message: "Database status not checked yet",
    },
    pinecone: {
      status: "unknown",
      message: "Pinecone status not checked yet",
    },
    openai: {
      status: "unknown",
      message: "OpenAI status not checked yet",
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

      if (!supabase) {
        throw new Error("Failed to initialize Supabase client")
      }

      // Simple query to check connection with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const { data, error } = await supabase.from("documents").select("id").limit(1)
      clearTimeout(timeoutId)

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
      healthStatus.debug.errors.push(`Database error: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Check Pinecone connection
    try {
      console.log("Checking Pinecone connection")

      // Add timeout for Pinecone check
      const pineconePromise = checkPineconeConnection()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Pinecone check timed out after 5 seconds")), 5000),
      )

      const pineconeResult = (await Promise.race([pineconePromise, timeoutPromise])) as any

      // Update health status with Pinecone result
      healthStatus.pinecone = pineconeResult

      if (pineconeResult.status === "unhealthy") {
        healthStatus.debug.errors.push(`Pinecone error: ${pineconeResult.message}`)
      } else {
        healthStatus.debug.info.push("Pinecone connection successful")
      }
    } catch (error) {
      console.error("Pinecone health check failed:", error)
      healthStatus.pinecone.status = "unhealthy"
      healthStatus.pinecone.message = `Pinecone connection failed: ${error instanceof Error ? error.message : String(error)}`
      healthStatus.debug.errors.push(`Pinecone error: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Check OpenAI connection
    try {
      console.log("Checking OpenAI connection")

      // Add timeout for OpenAI check
      const openAIPromise = checkOpenAIConnection()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("OpenAI check timed out after 5 seconds")), 5000),
      )

      const openAIResult = (await Promise.race([openAIPromise, timeoutPromise])) as any

      // Update health status with OpenAI result
      healthStatus.openai = openAIResult

      if (openAIResult.status === "unhealthy") {
        healthStatus.debug.errors.push(`OpenAI error: ${openAIResult.message}`)
      } else {
        healthStatus.debug.info.push("OpenAI connection successful")
      }
    } catch (error) {
      console.error("OpenAI health check failed:", error)
      healthStatus.openai.status = "unhealthy"
      healthStatus.openai.message = `OpenAI connection failed: ${error instanceof Error ? error.message : String(error)}`
      healthStatus.debug.errors.push(`OpenAI error: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Determine overall status
    if (
      healthStatus.database.status === "healthy" &&
      healthStatus.pinecone.status === "healthy" &&
      healthStatus.openai.status === "healthy"
    ) {
      healthStatus.status = "healthy"
    } else if (
      healthStatus.database.status === "unhealthy" ||
      healthStatus.pinecone.status === "unhealthy" ||
      healthStatus.openai.status === "unhealthy"
    ) {
      healthStatus.status = "unhealthy"
    } else {
      healthStatus.status = "degraded"
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
