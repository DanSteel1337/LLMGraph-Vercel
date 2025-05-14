import { NextResponse } from "next/server"

// Use Node.js runtime for consistency
export const runtime = "nodejs"

export async function GET() {
  console.log("Simple health check API called")

  // Initialize health status with default values
  const healthStatus = {
    status: "checking",
    api: {
      status: "healthy",
      message: "API is operational",
    },
    services: [] as Array<{
      name: string
      status: "healthy" | "unhealthy" | "unknown"
      message: string
      error?: string
    }>,
    timestamp: new Date().toISOString(),
  }

  // Check environment variables
  const envVars = [
    { name: "SUPABASE_URL", value: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL },
    { name: "SUPABASE_KEY", value: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    { name: "PINECONE_API_KEY", value: process.env.PINECONE_API_KEY },
    { name: "PINECONE_INDEX_NAME", value: process.env.PINECONE_INDEX_NAME },
    { name: "OPENAI_API_KEY", value: process.env.OPENAI_API_KEY },
  ]

  // Check each environment variable
  for (const env of envVars) {
    healthStatus.services.push({
      name: `${env.name} Environment Variable`,
      status: env.value ? "healthy" : "unhealthy",
      message: env.value ? "Environment variable is set" : "Environment variable is missing",
    })
  }

  // Determine overall status
  const hasUnhealthy = healthStatus.services.some((service) => service.status === "unhealthy")
  healthStatus.status = hasUnhealthy ? "unhealthy" : "healthy"

  return NextResponse.json(healthStatus)
}
