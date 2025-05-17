import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { processDocument } from "@/lib/api-handlers/documents"

export const runtime = "nodejs"

// This endpoint is for client-side initiated document processing
export async function POST(req: NextRequest) {
  try {
    const { documentId, content } = await req.json()

    if (!documentId || !content) {
      return NextResponse.json({ error: "Document ID and content are required" }, { status: 400 })
    }

    // Update document status
    const supabase = await createServerClient()
    await supabase.from("documents").update({ status: "processing" }).eq("id", documentId)

    // Process the document
    const result = await processDocument(documentId, content)

    // Update document status
    await supabase.from("documents").update({ status: "complete" }).eq("id", documentId)

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("Error processing document:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
