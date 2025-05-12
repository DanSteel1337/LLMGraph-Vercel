import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { processDocument } from "@/lib/ai-sdk"

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    // Check if the request is multipart/form-data
    if (!req.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Request must be multipart/form-data" }, { status: 400 })
    }

    // Parse the form data
    const formData = await req.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const category = formData.get("category") as string
    const version = formData.get("version") as string
    const description = formData.get("description") as string

    // Validate required fields
    if (!file || !title || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate a unique ID for the document
    const documentId = crypto.randomUUID()

    // Extract file content
    let content = ""
    if (file.type === "application/pdf") {
      // For PDF files, we would use a PDF parser
      // This is a simplified example
      const buffer = await file.arrayBuffer()
      // In a real implementation, you would use a PDF parser library
      content = `PDF content would be extracted here. This is a placeholder for ${title}.`
    } else {
      // For text files
      content = await file.text()
    }

    // Store document in Supabase
    const { data: document, error: documentError } = await supabase
      .from("documents")
      .insert({
        id: documentId,
        title,
        content,
        category,
        user_id: "system", // In a real app, this would be the authenticated user's ID
        metadata: {
          version,
          description,
          filename: file.name,
          size: file.size,
          contentType: file.type,
        },
      })
      .select()
      .single()

    if (documentError) {
      console.error("Error storing document in Supabase:", documentError)
      return NextResponse.json({ error: "Failed to store document" }, { status: 500 })
    }

    // Process document for Pinecone
    const metadata = {
      title,
      category,
      version,
      description,
      documentId,
    }

    const success = await processDocument(documentId, content, metadata)

    if (!success) {
      // Document was stored in Supabase but failed to process for Pinecone
      return NextResponse.json(
        {
          id: documentId,
          warning: "Document stored but vector processing failed",
        },
        { status: 207 }, // 207 Multi-Status
      )
    }

    return NextResponse.json({
      id: documentId,
      message: "Document uploaded and processed successfully",
    })
  } catch (error) {
    console.error("Error processing document upload:", error)
    return NextResponse.json(
      { error: "Failed to process document", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Fetch documents from Supabase
    const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching documents:", error)
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}
