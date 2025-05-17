import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { extractTextFromPDFBuffer, extractTextFromPDFBufferFallback } from "@/lib/server-pdf-processor"
import { generateEmbeddings } from "@/lib/ai/embeddings"
import { v4 as uuidv4 } from "uuid"

// Type definitions
export type Document = {
  id: string
  title: string
  content: string
  category: string
  version: string
  status: string
  created_at: string
  updated_at: string
}

export type DocumentInput = Omit<Document, "id" | "created_at" | "updated_at">

// Get all documents
export async function getDocuments() {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false })

    return { data, error }
  } catch (error) {
    console.error("Error in getDocuments:", error)
    return { data: null, error: error instanceof Error ? error : new Error("Unknown error in getDocuments") }
  }
}

// Get a document by ID
export async function getDocumentById(id: string) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("documents").select("*").eq("id", id).single()

    return { data, error }
  } catch (error) {
    console.error(`Error in getDocumentById for ID ${id}:`, error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error(`Unknown error in getDocumentById for ID ${id}`),
    }
  }
}

// Create a new document
export async function createDocument(document: DocumentInput) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from("documents")
      .insert([{ ...document, id: uuidv4() }])
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error("Error in createDocument:", error)
    return { data: null, error: error instanceof Error ? error : new Error("Unknown error in createDocument") }
  }
}

// Update a document
export async function updateDocument(id: string, updates: Partial<DocumentInput>) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("documents").update(updates).eq("id", id).select().single()

    return { data, error }
  } catch (error) {
    console.error(`Error in updateDocument for ID ${id}:`, error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error(`Unknown error in updateDocument for ID ${id}`),
    }
  }
}

// Delete a document
export async function deleteDocument(id: string) {
  try {
    const supabase = await createServerClient()

    // First, delete related chunks
    const { error: chunksError } = await supabase.from("document_chunks").delete().eq("document_id", id)

    if (chunksError) {
      return { success: false, error: chunksError }
    }

    // Then delete the document
    const { error } = await supabase.from("documents").delete().eq("id", id)

    return { success: error === null, error }
  } catch (error) {
    console.error(`Error in deleteDocument for ID ${id}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error(`Unknown error in deleteDocument for ID ${id}`),
    }
  }
}

// Get document chunks
export async function getDocumentChunks(documentId: string) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from("document_chunks")
      .select("*")
      .eq("document_id", documentId)
      .order("chunk_index", { ascending: true })

    return { data, error }
  } catch (error) {
    console.error(`Error in getDocumentChunks for document ID ${documentId}:`, error)
    return {
      data: null,
      error:
        error instanceof Error ? error : new Error(`Unknown error in getDocumentChunks for document ID ${documentId}`),
    }
  }
}

// Get document vectors
export async function getDocumentVectors(documentId: string) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("document_vectors").select("*").eq("document_id", documentId)

    return { data, error }
  } catch (error) {
    console.error(`Error in getDocumentVectors for document ID ${documentId}:`, error)
    return {
      data: null,
      error:
        error instanceof Error ? error : new Error(`Unknown error in getDocumentVectors for document ID ${documentId}`),
    }
  }
}

// Process document handler for multipart form data
export async function processDocumentHandler(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const title = formData.get("title") as string | null
    const category = formData.get("category") as string | null
    const version = formData.get("version") as string | null

    if (!file || !title) {
      return NextResponse.json({ error: "File and title are required" }, { status: 400 })
    }

    // Read file as buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Extract text from PDF
    let content: string
    try {
      content = await extractTextFromPDFBuffer(buffer)
    } catch (error) {
      console.warn("Error extracting text with PDF.js, using fallback:", error)
      content = extractTextFromPDFBufferFallback(buffer)
    }

    // Create document record
    const documentInput: DocumentInput = {
      title,
      content,
      category: category || "Uncategorized",
      version: version || "1.0",
      status: "processing",
    }

    const { data: document, error: docError } = await createDocument(documentInput)

    if (docError || !document) {
      return NextResponse.json({ error: docError?.message || "Failed to create document" }, { status: 500 })
    }

    // Process document in background (in a real app, this would be a background job)
    // For now, we'll just do it synchronously
    try {
      await processDocument(document.id, content)

      // Update document status to complete
      await updateDocument(document.id, { status: "complete" })
    } catch (error) {
      console.error("Error processing document:", error)
      await updateDocument(document.id, { status: "error" })
    }

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error("Error in processDocumentHandler:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

// Process document content into chunks and vectors
async function processDocument(documentId: string, content: string) {
  try {
    const supabase = await createServerClient()

    // Split content into chunks (simple implementation - in production use a more sophisticated chunking strategy)
    const chunks = splitIntoChunks(content, 1000)

    // Store chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      // Create chunk record
      const { error: chunkError } = await supabase.from("document_chunks").insert({
        document_id: documentId,
        chunk_index: i,
        content: chunk,
      })

      if (chunkError) {
        throw chunkError
      }

      // Generate embeddings for chunk
      try {
        const embedding = await generateEmbeddings(chunk)

        // Store embedding
        const { error: vectorError } = await supabase.from("document_vectors").insert({
          document_id: documentId,
          chunk_index: i,
          embedding,
        })

        if (vectorError) {
          throw vectorError
        }
      } catch (error) {
        console.error(`Error generating embedding for chunk ${i}:`, error)
        // Continue with other chunks even if one fails
      }
    }

    return true
  } catch (error) {
    console.error(`Error in processDocument for ID ${documentId}:`, error)
    throw error
  }
}

// Helper function to split text into chunks
function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = []
  let currentChunk = ""

  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/)

  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed chunk size, save current chunk and start a new one
    if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk)
      currentChunk = ""
    }

    // If paragraph itself is longer than chunk size, split it further
    if (paragraph.length > chunkSize) {
      // Split by sentences
      const sentences = paragraph.split(/(?<=[.!?])\s+/)

      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
          chunks.push(currentChunk)
          currentChunk = ""
        }

        // If sentence itself is longer than chunk size, split it by words
        if (sentence.length > chunkSize) {
          let remainingSentence = sentence

          while (remainingSentence.length > 0) {
            const chunk = remainingSentence.substring(0, chunkSize)
            chunks.push(chunk)
            remainingSentence = remainingSentence.substring(chunkSize)
          }
        } else {
          currentChunk += (currentChunk.length > 0 ? " " : "") + sentence
        }
      }
    } else {
      currentChunk += (currentChunk.length > 0 ? "\n\n" : "") + paragraph
    }
  }

  // Don't forget the last chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk)
  }

  return chunks
}
