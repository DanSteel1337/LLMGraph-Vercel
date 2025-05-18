import { generateEmbedding } from "./embeddings"
import { getPineconeIndex } from "@/lib/pinecone/client"
import { getSupabaseClient } from "@/lib/supabase/client"
import { logError } from "@/lib/error-handler"
import { validateEnvVar } from "@/lib/env-validator"

// Validate required environment variables
validateEnvVar("PINECONE_API_KEY")
validateEnvVar("PINECONE_INDEX_NAME")
validateEnvVar("NEXT_PUBLIC_SUPABASE_URL")
validateEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY")

/**
 * Process a document for indexing
 * @param id Document ID
 * @param title Document title
 * @param content Document content
 * @param metadata Additional metadata
 * @returns Processed document with embeddings
 */
export async function processDocument(id: string, title: string, content: string, metadata: Record<string, any> = {}) {
  try {
    // Validate inputs
    if (!id || !title || !content) {
      throw new Error("Document ID, title, and content are required")
    }

    // Generate embedding for document content
    const embedding = await generateEmbedding(content)

    // Prepare document for indexing
    const processedDocument = {
      id,
      title,
      content,
      ...metadata,
      embedding,
      processedAt: new Date().toISOString(),
    }

    return processedDocument
  } catch (error) {
    logError(error, "document_processing_error")
    throw new Error(`Failed to process document: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Insert a document into Pinecone
 * @param document Document to insert
 * @returns Result of the insertion
 */
export async function insertDocumentIntoPinecone(document: any) {
  try {
    // Get Pinecone index
    const index = getPineconeIndex()

    // Prepare document for Pinecone
    const { embedding, ...metadata } = document

    // Insert document into Pinecone
    const result = await index.upsert({
      vectors: [
        {
          id: document.id,
          values: embedding,
          metadata,
        },
      ],
    })

    // Update document status in Supabase
    const supabase = getSupabaseClient()
    await supabase
      .from("documents")
      .update({ status: "indexed", indexed_at: new Date().toISOString() })
      .eq("id", document.id)

    return result
  } catch (error) {
    logError(error, "pinecone_insert_error")
    throw new Error(
      `Failed to insert document into Pinecone: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

/**
 * Delete a document from Pinecone
 * @param documentId ID of the document to delete
 * @returns Result of the deletion
 */
export async function deleteDocumentFromPinecone(documentId: string) {
  try {
    // Get Pinecone index
    const index = getPineconeIndex()

    // Delete document from Pinecone
    const result = await index.delete({
      ids: [documentId],
    })

    // Update document status in Supabase
    const supabase = getSupabaseClient()
    await supabase
      .from("documents")
      .update({ status: "deleted", deleted_at: new Date().toISOString() })
      .eq("id", documentId)

    return result
  } catch (error) {
    logError(error, "pinecone_delete_error")
    throw new Error(
      `Failed to delete document from Pinecone: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

/**
 * Chunk a document into smaller pieces for better indexing
 * @param document Document to chunk
 * @param chunkSize Size of each chunk
 * @param overlap Overlap between chunks
 * @returns Array of document chunks
 */
export function chunkDocument(document: any, chunkSize = 1000, overlap = 200) {
  const { content, ...metadata } = document

  if (!content) {
    return [document]
  }

  const chunks = []
  let i = 0

  while (i < content.length) {
    // Calculate chunk boundaries
    const chunkStart = Math.max(0, i)
    const chunkEnd = Math.min(content.length, i + chunkSize)
    const chunk = content.slice(chunkStart, chunkEnd)

    // Create chunk document
    chunks.push({
      ...metadata,
      content: chunk,
      chunkIndex: chunks.length,
      parentDocumentId: document.id,
    })

    // Move to next chunk with overlap
    i += chunkSize - overlap
  }

  return chunks
}

/**
 * Batch process multiple documents
 * @param documents Array of documents to process
 * @returns Results of processing
 */
export async function batchProcessDocuments(documents: any[]) {
  const results = []
  const errors = []

  for (const document of documents) {
    try {
      const processedDocument = await processDocument(
        document.id,
        document.title,
        document.content,
        document.metadata || {},
      )
      const insertResult = await insertDocumentIntoPinecone(processedDocument)
      results.push({
        documentId: document.id,
        success: true,
        result: insertResult,
      })
    } catch (error) {
      logError(error, "batch_processing_error")
      errors.push({
        documentId: document.id,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  return {
    success: errors.length === 0,
    results,
    errors,
    totalProcessed: results.length,
    totalErrors: errors.length,
  }
}
