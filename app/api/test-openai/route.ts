import { NextResponse } from "next/server"
import { embed } from "ai"
import { openai } from "@ai-sdk/openai"

// Use Node.js runtime for consistency
export const runtime = "nodejs"

export async function GET() {
  console.log("Testing OpenAI connection...")

  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined")
    }

    console.log("OpenAI API key found, testing embedding generation...")

    // Test embedding
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: "test",
    })

    console.log(`Successfully generated embedding with length: ${embedding.length}`)

    return NextResponse.json({
      success: true,
      embeddingLength: embedding.length,
      embeddingSample: embedding.slice(0, 5), // Just show first 5 values
      message: "OpenAI connection successful",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("OpenAI test failed:", error)

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
