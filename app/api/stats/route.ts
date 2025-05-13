import { NextResponse } from "next/server"
import { getPineconeStats } from "@/lib/ai-sdk"
import { getDocumentCount, getSearchCount, getFeedbackCount } from "@/lib/db"

export async function GET() {
  try {
    // Get stats from database first (more likely to succeed)
    let totalDocuments = 0
    let totalSearches = 0
    let totalFeedback = 0

    try {
      totalDocuments = await getDocumentCount()
    } catch (dbError) {
      console.error("Error fetching document count:", dbError)
    }

    try {
      totalSearches = await getSearchCount()
    } catch (dbError) {
      console.error("Error fetching search count:", dbError)
    }

    try {
      totalFeedback = await getFeedbackCount()
    } catch (dbError) {
      console.error("Error fetching feedback count:", dbError)
    }

    // Get stats from Pinecone (might fail if Pinecone is unavailable)
    let pineconeStats = { vectorCount: 0, dimensions: 0, indexName: "unknown" }
    try {
      pineconeStats = await getPineconeStats()
    } catch (pineconeError) {
      console.error("Error fetching Pinecone stats:", pineconeError)
      // Continue with default values
    }

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

    // Return a more detailed error response
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        message: error instanceof Error ? error.message : String(error),
        totalDocuments: 0,
        totalSearches: 0,
        totalFeedback: 0,
        vectorCount: 0,
        dimensions: 0,
        indexName: "unknown",
      },
      { status: 500 },
    )
  }
}
