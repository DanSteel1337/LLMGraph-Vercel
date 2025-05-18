import type { NextRequest } from "next/server"
import { handleAuthCallback } from "@/lib/api-handlers/auth"
import { shouldUseMockData } from "@/lib/environment"
import { NextResponse } from "next/server"

export const runtime = "edge" // Use Edge runtime for better performance

export async function GET(req: NextRequest) {
  // Check if we should use mock data
  if (shouldUseMockData()) {
    return NextResponse.json({ success: true, redirectTo: "/", isMockData: true })
  }

  return handleAuthCallback(req)
}
