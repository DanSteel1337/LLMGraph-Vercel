import { NextResponse } from "next/server"
import { getPineconeStats } from "@/lib/pinecone-client"

// Use Node.js runtime for Pinecone
export const runtime = "nodejs"

export async function GET() {
  console.log("Testing Pinecone connection...")

  try {
    // Check if API key exists
    if (!process.env.PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY is not defined")
    }

    // Check if index name exists
    if (!process.env.PINECONE_INDEX_NAME) {
      throw new Error("PINECONE_INDEX_NAME is not defined")
    }

    console.log(`Attempting to connect to Pinecone index: ${process.env.PINECONE_INDEX_NAME}`)

    // Get stats
    const stats = await getPineconeStats()
    console.log("Pinecone stats retrieved successfully:", stats)

    return NextResponse.json({
      success: true,
      stats,
      message: "Pinecone connection successful",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Pinecone test failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }, // Return 200 even for errors
    )
  }
}
