import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { processDocument } from "@/lib/ai-sdk"
import { v4 as uuidv4 } from "uuid"
import { extractTextFromFile } from "@/lib/document-processor"

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
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

    if (!file || !title || !category || !version) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate document ID
    const documentId = uuidv4()

    // Save file to temporary storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // In a real app, you'd save this to a file system or blob storage
    // For this example, we'll extract text directly

    // Extract text from file
    const content = await extractTextFromFile(buffer, file.name)

    if (!content) {
      return NextResponse.json({ error: "Failed to extract text from file" }, { status: 400 })
    }

    // Create document metadata
    const metadata = {
      id: documentId,
      title,
      category,
      version,
      description,
      tags,
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

    // Save document metadata to database
    // In a real app, you'd save this to your database
    // For this example, we'll just return success

    return NextResponse.json({
      id: documentId,
      status: "processing",
      message: "Document uploaded and processing started",
    })
  } catch (error) {
    console.error("Document upload error:", error)
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 })
  }
}
