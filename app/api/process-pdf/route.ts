import { type NextRequest, NextResponse } from "next/server"
import { processDocument } from "@/lib/document-processor"
import { getDirectSupabaseClient } from "@/lib/supabase/server"

// Use Node.js runtime for PDF processing
export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    // Get the PDF file and metadata from the request
    const formData = await req.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const category = formData.get("category") as string
    const version = formData.get("version") as string
    const documentId = (formData.get("documentId") as string) || crypto.randomUUID()

    if (!file || !title || !category) {
      return NextResponse.json({ error: "File, title, and category are required" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Process the document
    const result = await processDocument(buffer, {
      title,
      category,
      version: version || "1.0",
      documentId,
    })

    // Update document status in Supabase
    const supabase = getDirectSupabaseClient()
    await supabase
      .from("documents")
      .update({
        status: "processed",
        metadata: {
          size: file.size,
          pages: Math.ceil(result.textLength / 3000), // Rough estimate
          chunks: result.chunksProcessed,
          version: version || "1.0",
        },
      })
      .eq("id", documentId)

    return NextResponse.json({
      success: true,
      documentId,
      chunksProcessed: result.chunksProcessed,
      textLength: result.textLength,
    })
  } catch (error) {
    console.error("Error processing PDF:", error)
    return NextResponse.json(
      {
        error: "Failed to process PDF",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
