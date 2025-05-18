import { shouldUseMockData } from "@/lib/environment"
import { getMockChunks } from "@/lib/mock-data"
import { logError } from "@/lib/error-handler"

/**
 * Split document into chunks for embedding
 * @param document Document to split
 * @param options Chunking options
 * @returns Array of chunks
 */
export function chunkDocument(
  document: { id: string; content: string; metadata?: Record<string, any> },
  options: {
    chunkSize?: number
    chunkOverlap?: number
    preserveParagraphs?: boolean
  } = {},
) {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      console.log("[MOCK] Using mock document chunks")
      return getMockChunks(document.id)
    }

    // Set default options
    const chunkSize = options.chunkSize || 1000
    const chunkOverlap = options.chunkOverlap || 200
    const preserveParagraphs = options.preserveParagraphs !== false

    // Implement actual chunking logic here
    // This would typically involve:
    // 1. Split content into paragraphs if preserveParagraphs is true
    // 2. Split paragraphs into chunks of chunkSize with chunkOverlap
    // 3. Add metadata to each chunk

    // For now, we'll just return a placeholder
    const chunks = []
    const content = document.content

    // Simple chunking by character count
    for (let i = 0; i < content.length; i += chunkSize - chunkOverlap) {
      const chunkContent = content.substring(i, i + chunkSize)
      chunks.push({
        id: `${document.id}-chunk-${chunks.length + 1}`,
        content: chunkContent,
        metadata: {
          ...document.metadata,
          documentId: document.id,
          chunkIndex: chunks.length,
        },
      })
    }

    return chunks
  } catch (error) {
    logError(error, "document_chunking_error")
    throw new Error(`Document chunking failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Extract metadata from document content
 * @param content Document content
 * @returns Extracted metadata
 */
export function extractMetadata(content: string) {
  // Check if we should use mock data
  if (shouldUseMockData()) {
    console.log("[MOCK] Using mock metadata extraction")
    return {
      category: "Blueprint",
      version: "5.4",
      topics: ["Gameplay", "UI"],
      isMockData: true,
    }
  }

  // Implement metadata extraction logic here
  // This would typically involve:
  // 1. Extract categories, versions, topics, etc. from content
  // 2. Return structured metadata

  // For now, we'll just return a placeholder
  return {
    category: "Unknown",
    version: "Unknown",
    topics: [],
  }
}

/**
 * Process document for indexing
 * @param document Document to process
 * @returns Processed document with chunks and metadata
 */
export async function processDocument(document: { id: string; content: string; metadata?: Record<string, any> }) {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      console.log("[MOCK] Using mock document processing")
      return {
        id: document.id,
        chunks: getMockChunks(document.id),
        metadata: {
          ...document.metadata,
          category: "Blueprint",
          version: "5.4",
          topics: ["Gameplay", "UI"],
        },
        isMockData: true,
      }
    }

    // Extract metadata
    const extractedMetadata = extractMetadata(document.content)

    // Chunk document
    const chunks = chunkDocument(document)

    // Return processed document
    return {
      id: document.id,
      chunks,
      metadata: {
        ...document.metadata,
        ...extractedMetadata,
      },
    }
  } catch (error) {
    logError(error, "document_processing_error")
    throw new Error(`Document processing failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
