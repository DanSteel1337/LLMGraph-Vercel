import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { v4 as uuidv4 } from "uuid"
import { processDocument } from "./ai-sdk"

// Maximum size for document chunks (in characters)
const MAX_CHUNK_SIZE = 1000
// Overlap between chunks to maintain context
const CHUNK_OVERLAP = 200

export async function extractTextFromFile(fileBuffer: Buffer | ArrayBuffer, fileName: string): Promise<string | null> {
  try {
    // Convert ArrayBuffer to Buffer if needed
    const buffer = fileBuffer instanceof ArrayBuffer ? Buffer.from(fileBuffer) : fileBuffer

    // Get file extension
    const extension = fileName.split(".").pop()?.toLowerCase()

    // Handle different file types
    if (extension === "txt" || extension === "md" || extension === "json") {
      return buffer.toString("utf-8")
    } else if (extension === "pdf") {
      // In a real implementation, you would use a PDF parsing library
      // For this example, we'll return a mock extraction
      console.log("PDF extraction would happen here with a proper library")
      return `Mock text extraction from PDF file: ${fileName}. In a real implementation, you would use a library like pdf-parse.`
    } else if (extension === "docx" || extension === "doc") {
      // In a real implementation, you would use a Word document parsing library
      console.log("Word document extraction would happen here with a proper library")
      return `Mock text extraction from Word document: ${fileName}. In a real implementation, you would use a library like mammoth.`
    } else {
      console.warn(`Unsupported file type: ${extension}`)
      return null
    }
  } catch (error) {
    console.error("Error extracting text from file:", error)
    return null
  }
}

export function chunkDocument(text: string): string[] {
  // Simple chunking by splitting on paragraphs and then combining
  // In a real implementation, you might use more sophisticated chunking
  const paragraphs = text.split(/\n\s*\n/)
  const chunks: string[] = []

  let currentChunk = ""

  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed the max chunk size,
    // save the current chunk and start a new one
    if (currentChunk.length + paragraph.length > MAX_CHUNK_SIZE) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk)
      }

      // Start a new chunk
      // If the paragraph itself is too long, split it further
      if (paragraph.length > MAX_CHUNK_SIZE) {
        // Split long paragraphs by sentences
        const sentences = paragraph.split(/(?<=[.!?])\s+/)
        let sentenceChunk = ""

        for (const sentence of sentences) {
          if (sentenceChunk.length + sentence.length > MAX_CHUNK_SIZE) {
            if (sentenceChunk.length > 0) {
              chunks.push(sentenceChunk)
            }
            // If the sentence itself is too long, split it by words
            if (sentence.length > MAX_CHUNK_SIZE) {
              let i = 0
              while (i < sentence.length) {
                chunks.push(sentence.slice(i, i + MAX_CHUNK_SIZE))
                i += MAX_CHUNK_SIZE - CHUNK_OVERLAP
              }
            } else {
              sentenceChunk = sentence
            }
          } else {
            sentenceChunk += (sentenceChunk ? " " : "") + sentence
          }
        }

        if (sentenceChunk.length > 0) {
          currentChunk = sentenceChunk
        } else {
          currentChunk = ""
        }
      } else {
        currentChunk = paragraph
      }
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk)
  }

  return chunks
}

export async function processDocumentForEmbedding(
  file: File,
  metadata: {
    title: string
    category: string
    version: string
    description?: string
    tags?: string[]
  },
): Promise<{ success: boolean; documentId?: string; error?: string }> {
  try {
    // Extract text from file
    const buffer = await file.arrayBuffer()
    const text = await extractTextFromFile(buffer, file.name)

    if (!text) {
      return { success: false, error: "Failed to extract text from file" }
    }

    // Generate document ID
    const documentId = uuidv4()

    // Chunk the document
    const chunks = chunkDocument(text)
    console.log(`Document chunked into ${chunks.length} chunks`)

    // Process each chunk and store in Pinecone
    let successCount = 0

    for (let i = 0; i < chunks.length; i++) {
      const chunkId = `${documentId}-chunk-${i}`
      const chunkMetadata = {
        ...metadata,
        documentId,
        chunkIndex: i,
        totalChunks: chunks.length,
        filename: file.name,
        size: file.size,
      }

      const success = await processDocument(chunkId, chunks[i], chunkMetadata)

      if (success) {
        successCount++
      }
    }

    console.log(`Successfully processed ${successCount} of ${chunks.length} chunks`)

    // Store document metadata in Supabase
    const supabase = createClientComponentClient()

    const { error } = await supabase.from("documents").insert({
      id: documentId,
      title: metadata.title,
      content: text.substring(0, 1000) + (text.length > 1000 ? "..." : ""), // Store preview only
      category: metadata.category,
      metadata: {
        version: metadata.version,
        description: metadata.description || "",
        tags: metadata.tags || [],
        filename: file.name,
        size: file.size,
        chunkCount: chunks.length,
      },
    })

    if (error) {
      console.error("Error saving document to database:", error)
      return { success: false, error: "Failed to save document metadata" }
    }

    return { success: true, documentId }
  } catch (error) {
    console.error("Error processing document:", error)
    return { success: false, error: "Failed to process document" }
  }
}
