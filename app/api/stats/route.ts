import { NextResponse } from "next/server"
import { getPineconeStats } from "@/lib/ai-sdk"
import { getDocumentCount, getSearchCount, getFeedbackCount } from "@/lib/db"

export async function GET() {
  try {
    // Get stats from Pinecone
    const pineconeStats = await getPineconeStats()

    // Get stats from database
    const totalDocuments = await getDocumentCount()
    const totalSearches = await getSearchCount()
    const totalFeedback = await getFeedbackCount()

    // Return all stats
    return NextResponse.json({
      totalDocuments,
      totalSearches,
      totalFeedback,
      vectorCount: pineconeStats.vectorCount,
      dimensions: pineconeStats.dimensions,
      indexName: pineconeStats.indexName,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
