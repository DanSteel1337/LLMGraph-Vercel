import { type NextRequest, NextResponse } from "next/server"
import { processDocument } from "@/lib/ai-sdk"
import { v4 as uuidv4 } from "uuid"
import { extractTextFromFile } from "@/lib/document-processor"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    // Check authentication using Supabase
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Parse form data
    const formData = await req.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const category = formData.get("category") as string
    const version = formData.get("version") as string
    const description = (formData.get("description") as string) || ""
    const tags = (formData.get("tags") as string) || ""
    const extractedText = formData.get("extractedText") as string // Get pre-extracted text if available

    if (!file || !title || !category || !version) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate document ID
    const documentId = uuidv4()

    // Save file to temporary storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Use pre-extracted text if available (for PDFs processed on the client)
    let content = extractedText

    // If no pre-extracted text, try to extract it on the server
    if (!content) {
      content = await extractTextFromFile(buffer, file.name)
    }

    if (!content) {
      content = `Unable to extract text from ${file.name}. File was uploaded but content is not searchable.`
    }

    // Create document metadata
    const metadata = {
      id: documentId,
      title,
      category,
      version,
      description,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      filename: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: session.user?.email || "unknown",
    }

    // Process document and store in vector database
    const success = await processDocument(documentId, content, metadata)

    if (!success) {
      return NextResponse.json({ error: "Failed to process document" }, { status: 500 })
    }

    // Save document metadata to Supabase
    const { error } = await supabase.from("documents").insert({
      id: documentId,
      title,
      content: content.substring(0, 1000) + (content.length > 1000 ? "..." : ""), // Store preview only
      category,
      user_id: session.user.id,
      metadata: {
        version,
        description,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        filename: file.name,
        size: file.size,
      },
    })

    if (error) {
      console.error("Error saving document to database:", error)
      return NextResponse.json({ error: "Failed to save document metadata" }, { status: 500 })
    }

    return NextResponse.json({
      id: documentId,
      status: "success",
      message: "Document uploaded and processed successfully",
    })
  } catch (error) {
    console.error("Document upload error:", error)
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 })
  }
}
