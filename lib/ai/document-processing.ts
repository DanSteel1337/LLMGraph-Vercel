import { embedWithRetry } from "./embeddings"
import { upsertVectors, deleteVectorsByFilter } from "../pinecone/client"

interface ChunkMetadata {
  documentId: string
  title: string
  category: string
  version: string
  chunkIndex: number
  totalChunks: number
  createdAt: string
  section?: string
  subsection?: string
  pageNumber?: number
}

/**
 * Process a document for indexing
 * @param id Document ID
 * @param title Document title
 * @param content Document content
 * @param metadata Additional metadata
 * @returns Processing result
 */
export async function processDocument(id: string, title: string, content: string, metadata: Record<string, any> = {}) {
  try {
    console.log(`Processing document: ${title} (${id})`)

    // Split content into chunks
    const chunks = splitIntoChunks(content)

    // Insert document into Pinecone
    const result = await insertDocumentIntoPinecone(id, title, content, metadata, chunks)

    return { success: true, chunksProcessed: chunks.length }
  } catch (error) {
    console.error("Error processing document:", error)
    throw error
  }
}

/**
 * Split content into chunks with overlap
 * @param content Document content
 * @param chunkSize Size of each chunk
 * @param overlap Overlap between chunks
 * @returns Array of content chunks
 */
export function splitIntoChunks(content: string, chunkSize = 1000, overlap = 200) {
  const chunks = []

  for (let i = 0; i < content.length; i += chunkSize - overlap) {
    const chunk = content.substring(i, i + chunkSize)
    if (chunk.length < 50) continue // Skip very small chunks

    chunks.push({
      content: chunk,
      metadata: {
        chunkIndex: chunks.length,
      },
    })
  }

  return chunks
}

/**
 * Insert document into Pinecone
 * @param id Document ID
 * @param title Document title
 * @param content Full document content
 * @param metadata Additional metadata
 * @param chunks Content chunks
 * @returns Insertion result
 */
export async function insertDocumentIntoPinecone(
  id: string,
  title: string,
  content: string,
  metadata: Record<string, any>,
  chunks: { content: string; metadata: Record<string, any> }[],
) {
  try {
    console.log(`Inserting document into Pinecone: ${title} (${id})`)

    // Process chunks and generate embeddings
    const vectors = await Promise.all(
      chunks.map(async (chunk, i) => {
        const embedding = await embedWithRetry(chunk.content)
        return {
          id: `${id}_chunk_${i}`,
          values: embedding,
          metadata: {
            ...chunk.metadata,
            ...metadata,
            documentId: id,
            title,
            text: chunk.content,
            chunkIndex: i,
          },
        }
      }),
    )

    // Insert vectors in batches to avoid rate limits
    const batchSize = 100
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize)
      await upsertVectors(batch)
    }

    return { success: true, chunksInserted: vectors.length }
  } catch (error) {
    console.error("Error inserting document into Pinecone:", error)
    throw error
  }
}

/**
 * Delete document from Pinecone
 * @param id Document ID
 * @returns Deletion result
 */
export async function deleteDocumentFromPinecone(id: string) {
  try {
    console.log(`Deleting document from Pinecone: ${id}`)

    // Delete by metadata filter
    await deleteVectorsByFilter({
      documentId: id,
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting document from Pinecone:", error)
    throw error
  }
}

/**
 * Delete document vectors
 * @param documentId Document ID
 * @returns Deletion result
 */
export async function deleteDocumentVectors(documentId: string) {
  return deleteDocumentFromPinecone(documentId)
}

interface TextChunk {
  text: string
  section?: string
  subsection?: string
}

/**
 * Track document processing status
 * @param documentId Document ID
 * @param status Processing status
 * @param progress Progress percentage (0-100)
 * @param error Optional error message
 */
export async function updateProcessingStatus(
  documentId: string,
  status: "processing" | "completed" | "failed",
  progress = 0,
  error?: string,
) {
  try {
    await fetch("/api/documents/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentId,
        status,
        progress,
        error,
      }),
    })
  } catch (e) {
    console.error("Error updating processing status:", e)
  }
}
