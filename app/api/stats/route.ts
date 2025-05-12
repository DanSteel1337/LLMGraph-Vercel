import { NextResponse } from "next/server"

export async function GET() {
  // Return mock data for now
  return NextResponse.json({
    totalDocuments: 156,
    totalSearches: 1243,
    totalFeedback: 28,
    vectorCount: 4872,
  })
}
