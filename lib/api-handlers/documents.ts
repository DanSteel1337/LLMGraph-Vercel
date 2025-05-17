/**
 * Document API Handlers
 * Centralizes all document-related API functionality
 */
import { createClient } from "@/lib/supabase/server"
import { processDocument } from "@/lib/document-processor"
import { type NextRequest, NextResponse } from "next/server"

// Get all documents
export async function getDocuments() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching documents:", error)
      return { error }
    }

    return { data }
  } catch (error) {
    console.error("Error in getDocuments:", error)
    return { error }
  }
}

// Get a single document by ID
export async function getDocumentById(id: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("documents").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching document ${id}:`, error)
      return { error }
    }

    return { data }
  } catch (error) {
    console.error(`Error in getDocumentById for ${id}:`, error)
    return { error }
  }
}

// Create a new document
export async function createDocument(document: any) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("documents").insert(document).select().single()

    if (error) {
      console.error("Error creating document:", error)
      return { error }
    }

    return { data }
  } catch (error) {
    console.error("Error in createDocument:", error)
    return { error }
  }
}

// Update a document
export async function updateDocument(id: string, updates: any) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("documents").update(updates).eq("id", id).select().single()

    if (error) {
      console.error(`Error updating document ${id}:`, error)
      return { error }
    }

    return { data }
  } catch (error) {
    console.error(`Error in updateDocument for ${id}:`, error)
    return { error }
  }
}

// Delete a document
export async function deleteDocument(id: string) {
  try {
    const supabase = createClient()
    const { error } = await supabase.from("documents").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting document ${id}:`, error)
      return { error }
    }

    return { success: true }
  } catch (error) {
    console.error(`Error in deleteDocument for ${id}:`, error)
    return { error }
  }
}

// Process a document (PDF)
export async function processDocumentHandler(req: NextRequest) {
  try {
    // Get the PDF file and metadata from the request
    const formData = await req.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const category = formData.get("category") as string
    const version = formData.get("version") as string
    const documentId = (formData.get("documentId") as string) || crypto.randomUUID()

    if (!file || !title) {
      return NextResponse.json({ error: "File and title are required" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Process the document
    const result = await processDocument(buffer, {
      title,
      category: category || "Uncategorized",
      version: version || "1.0",
      documentId,
    })

    // Update document status in Supabase
    const supabase = createClient()
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
    console.error("Error processing document:", error)
    return NextResponse.json(
      {
        error: "Failed to process document",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Get document chunks
export async function getDocumentChunks(id: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("chunks")
      .select("*")
      .eq("document_id", id)
      .order("chunk_index", { ascending: true })

    if (error) {
      console.error(`Error fetching chunks for document ${id}:`, error)
      return { error }
    }

    return { data }
  } catch (error) {
    console.error(`Error in getDocumentChunks for ${id}:`, error)
    return { error }
  }
}

// Get document vectors
export async function getDocumentVectors(id: string) {
  try {
    // Implementation depends on your vector store (Pinecone, etc.)
    // This is a placeholder that would be implemented based on your vector store
    return { data: [] }
  } catch (error) {
    console.error(`Error in getDocumentVectors for ${id}:`, error)
    return { error }
  }
}
