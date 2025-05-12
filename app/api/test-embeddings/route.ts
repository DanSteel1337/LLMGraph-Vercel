import { NextResponse } from "next/server"
import { testEmbeddings } from "@/lib/test-embeddings"

export async function GET() {
  try {
    const result = await testEmbeddings()

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in test embeddings API:", error)
    return NextResponse.json({ error: "Failed to test embeddings" }, { status: 500 })
  }
}
