import { embedWithRetry } from "./embeddings"
import { upsertVectors, upsertVectorsToNamespace } from "../pinecone/client"
import { deleteVectorsByFilter } from "../pinecone/client"

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
 * Process a document by chunking it and creating vector embeddings
 * @param documentId Unique document ID
 * @param content Document content
 * @param metadata Document metadata
 * @param namespace Optional Pinecone namespace
 * @returns Success status
 */
export async function processDocument(
  documentId: string,
  content: string,
  metadata: Record<string, any>,
  namespace?: string,
): Promise<boolean> {
  try {
    // Create chunks with advanced chunking strategy
    const chunks = createSemanticChunks(content)

    // Process each chunk
    const vectors = await Promise.all(
      chunks.map(async (chunk, i) => {
        // Generate embedding for the chunk
        const embedding = await embedWithRetry(chunk.text)

        // Create chunk metadata
        const chunkMetadata: ChunkMetadata = {
          documentId,
          title: metadata.title || "Untitled Document",
          category: metadata.category || "Uncategorized",
          version: metadata.version || "1.0",
          chunkIndex: i,
          totalChunks: chunks.length,
          createdAt: new Date().toISOString(),
          section: chunk.section,
          subsection: chunk.subsection,
          pageNumber: metadata.pageNumber,
        }

        return {
          id: `${documentId}-chunk-${i}`,
          values: embedding,
          metadata: {
            ...chunkMetadata,
            text: chunk.text,
          },
        }
      }),
    )

    // Upsert vectors to Pinecone
    if (namespace) {
      await upsertVectorsToNamespace(vectors, namespace)
    } else {
      await upsertVectors(vectors)
    }

    return true
  } catch (error) {
    console.error("Error processing document:", error)
    return false
  }
}

interface TextChunk {
  text: string
  section?: string
  subsection?: string
}

/**
 * Create semantic chunks from document content
 * This is a more advanced chunking strategy that tries to preserve
 * semantic boundaries like paragraphs, sections, and subsections
 * @param content Document content
 * @returns Array of text chunks with metadata
 */
function createSemanticChunks(content: string): TextChunk[] {
  const chunks: TextChunk[] = []
  const maxChunkSize = 1000
  const minChunkSize = 100

  // Split content by section headers
  const sectionPattern = /\n#{1,3}\s+(.+)\n/g
  const sections = content.split(sectionPattern).filter(Boolean)

  let currentSection = ""
  let currentSubsection = ""

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]

    // Check if this is a section header
    if (section.trim().length < 100 && i < sections.length - 1) {
      if (section.startsWith("# ")) {
        currentSection = section.replace("# ", "").trim()
        currentSubsection = ""
      } else if (section.startsWith("## ")) {
        currentSubsection = section.replace("## ", "").trim()
      }
      continue
    }

    // Split section into paragraphs
    const paragraphs = section.split(/\n\s*\n/).filter(Boolean)

    let currentChunk = ""
    const currentChunkMetadata: Omit<TextChunk, "text"> = {
      section: currentSection,
      subsection: currentSubsection,
    }

    for (const paragraph of paragraphs) {
      // If adding this paragraph would exceed max chunk size, save current chunk and start a new one
      if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length >= minChunkSize) {
        chunks.push({
          text: currentChunk.trim(),
          ...currentChunkMetadata,
        })
        currentChunk = ""
      }

      // Add paragraph to current chunk
      currentChunk += paragraph + "\n\n"
    }

    // Add the last chunk if it's not empty
    if (currentChunk.trim().length >= minChunkSize) {
      chunks.push({
        text: currentChunk.trim(),
        ...currentChunkMetadata,
      })
    }
  }

  return chunks
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

// Function to delete document from vector store
export async function deleteDocumentVectors(documentId: string): Promise<boolean> {
  try {
    console.log(`Deleting vectors for document ${documentId}`)

    // Delete all vectors with matching documentId in metadata
    await deleteVectorsByFilter({
      documentId: { $eq: documentId },
    })

    console.log(`Successfully deleted vectors for document ${documentId}`)
    return true
  } catch (error) {
    console.error("Error deleting document vectors:", error)
    return false
  }
}
