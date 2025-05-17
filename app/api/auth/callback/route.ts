import type { NextRequest } from "next/server"
import { handleAuthCallback } from "@/lib/api-handlers/auth"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

export async function GET(req: NextRequest) {
  return handleAuthCallback(req)
}
