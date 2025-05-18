import { NextResponse } from "next/server"
import { getPineconeIndex } from "@/lib/pinecone/client"
import { shouldUseMockData } from "@/lib/environment"

export const runtime = "edge"

export async function GET() {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      return NextResponse.json({
        success: true,
        details: {
          indexes: ["unreal-docs"],
          namespace: "default",
          dimensions: 1536,
          vectorCount: 3750,
          status: "ready",
        },
        isMockData: true,
      })
    }

    // Real connection test
    const pineconeIndex = getPineconeIndex()
    const stats = await pineconeIndex.describeIndexStats()

    const indexDetails = {
      namespace: stats.namespaces ? Object.keys(stats.namespaces)[0] : "default",
      dimensions: stats.dimension,
      vectorCount: stats.totalVectorCount,
      status: "connected",
    }

    return NextResponse.json({
      success: true,
      details: {
        indexes: [process.env.PINECONE_INDEX_NAME || "unknown"],
        ...indexDetails,
      },
    })
  } catch (error) {
    console.error("Pinecone diagnostics error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
