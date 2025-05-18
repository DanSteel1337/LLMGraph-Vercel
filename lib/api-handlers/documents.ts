import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"
import { shouldUseMockData } from "@/lib/environment"
import { MOCK_DOCUMENTS } from "@/lib/mock-data"

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
    // Check if we should use mock data
    if (shouldUseMockData()) {
      return {
        data: MOCK_DOCUMENTS,
        isMockData: true,
      }
    }

    const supabase = await createServerClient()
    const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false })

    return { data, error }
  } catch (error) {
    console.error("Error in getDocuments:", error)
    return {
      data: MOCK_DOCUMENTS,
      error: error instanceof Error ? error : new Error("Unknown error in getDocuments"),
      isMockData: true,
    }
  }
}

// Get a document by ID
export async function getDocumentById(id: string) {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      const mockDocument = MOCK_DOCUMENTS.find((doc) => doc.id === id) || {
        id,
        title: "Mock Document",
        description: "This is a mock document for testing purposes",
        category: "Testing",
        version: "1.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "published",
        pageCount: 1,
      }

      return {
        data: mockDocument,
        isMockData: true,
      }
    }

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
    // Check if we should use mock data
    if (shouldUseMockData()) {
      const mockDocument = {
        ...document,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      return {
        data: mockDocument,
        isMockData: true,
      }
    }

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
    // Check if we should use mock data
    if (shouldUseMockData()) {
      const mockDocument = {
        id,
        ...updates,
        updated_at: new Date().toISOString(),
      }

      return {
        data: mockDocument,
        isMockData: true,
      }
    }

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
    // Check if we should use mock data
    if (shouldUseMockData()) {
      return {
        success: true,
        isMockData: true,
      }
    }

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
    // Check if we should use mock data
    if (shouldUseMockData()) {
      return {
        data: [
          {
            id: "chunk-1",
            document_id: documentId,
            chunk_index: 0,
            content: "This is a mock document chunk for testing purposes.",
          },
        ],
        isMockData: true,
      }
    }

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
    // Check if we should use mock data
    if (shouldUseMockData()) {
      return {
        data: [
          {
            id: "vector-1",
            document_id: documentId,
            vector: Array(10).fill(0.1),
          },
        ],
        isMockData: true,
      }
    }

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
    // Check if we should use mock data
    if (shouldUseMockData()) {
      return NextResponse.json(
        {
          document: {
            id: "mock-doc-" + Date.now(),
            title: "Uploaded Document",
            status: "processed",
            created_at: new Date().toISOString(),
          },
          message: "Document uploaded and ready for processing (mock)",
          isMockData: true,
        },
        { status: 201 },
      )
    }

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

    // Instead of trying to extract text from PDF, we'll just store the file
    // and create a placeholder for the content
    const content = `Document: ${title}
Category: ${category || "Uncategorized"}
Version: ${version || "1.0"}
Size: ${buffer.length} bytes

This document was uploaded but text extraction is performed client-side.
The document will be processed when viewed.`

    // Create document record
    const documentInput: DocumentInput = {
      title,
      content,
      category: category || "Uncategorized",
      version: version || "1.0",
      status: "pending_processing",
    }

    const { data: document, error: docError } = await createDocument(documentInput)

    if (docError || !document) {
      return NextResponse.json({ error: docError?.message || "Failed to create document" }, { status: 500 })
    }

    // Store the raw file in Supabase Storage for later processing
    try {
      const supabase = await createServerClient()
      const { error: storageError } = await supabase.storage
        .from("document_files")
        .upload(`${document.id}.pdf`, buffer, {
          contentType: "application/pdf",
          upsert: true,
        })

      if (storageError) {
        console.error("Error storing PDF file:", storageError)
        await updateDocument(document.id, { status: "error_storing_file" })
        return NextResponse.json({ error: "Failed to store document file" }, { status: 500 })
      }

      // Update document status
      await updateDocument(document.id, { status: "ready_for_processing" })
    } catch (error) {
      console.error("Error in file storage:", error)
      await updateDocument(document.id, { status: "error" })
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Unknown error storing file" },
        { status: 500 },
      )
    }

    return NextResponse.json({ document, message: "Document uploaded and ready for processing" }, { status: 201 })
  } catch (error) {
    console.error("Error in processDocumentHandler:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

// Process document content into chunks and vectors
export async function processDocument(documentId: string, content: string) {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      return {
        success: true,
        chunksProcessed: 5,
        isMockData: true,
      }
    }

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
    }

    return { success: true, chunksProcessed: chunks.length }
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
