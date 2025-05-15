import { extractTextFromPDFBuffer, extractTextFromPDFBufferFallback } from "./server-pdf-processor"
import { insertDocumentIntoPinecone } from "./ai-sdk"

// Function to chunk text into smaller pieces
export function chunkText(text: string, maxChunkSize = 1000, overlap = 200): string[] {
  // Remove excessive whitespace
  const cleanedText = text.replace(/\s+/g, " ").trim()

  if (cleanedText.length <= maxChunkSize) {
    return [cleanedText]
  }

  const chunks: string[] = []
  let startIndex = 0

  while (startIndex < cleanedText.length) {
    // Get chunk of maxChunkSize or remaining text if smaller
    let endIndex = startIndex + maxChunkSize

    // If not at the end of text, try to find a good breaking point
    if (endIndex < cleanedText.length) {
      // Look for natural breaking points like periods, paragraphs, etc.
      const breakPoints = [". ", ".\n", "\n\n", "\n", ". ", ", ", " "]

      let foundBreakPoint = false

      for (const breakPoint of breakPoints) {
        const breakPointIndex = cleanedText.lastIndexOf(breakPoint, endIndex)

        if (breakPointIndex > startIndex && breakPointIndex <= endIndex) {
          endIndex = breakPointIndex + 1 // Include the breaking character
          foundBreakPoint = true
          break
        }
      }

      // If no good breaking point, just break at maxChunkSize
      if (!foundBreakPoint) {
        endIndex = startIndex + maxChunkSize
      }
    }

    // Add chunk
    chunks.push(cleanedText.substring(startIndex, endIndex).trim())

    // Move start index for next chunk, accounting for overlap
    startIndex = endIndex - overlap

    // Ensure we're making progress
    if (startIndex <= 0 || startIndex >= cleanedText.length) {
      break
    }
  }

  return chunks
}

// Process document and insert into Pinecone
export async function processDocument(
  file: Buffer,
  metadata: {
    title: string
    category: string
    version: string
    documentId: string
  },
) {
  try {
    // Extract text from PDF
    let text: string
    try {
      text = await extractTextFromPDFBuffer(file)
    } catch (error) {
      console.warn("Error using primary PDF extractor, falling back to alternative method:", error)
      text = extractTextFromPDFBufferFallback(file)
    }

    // Chunk the text
    const textChunks = chunkText(text)

    // Prepare chunks with metadata
    const chunks = textChunks.map((content) => ({
      content,
      metadata: {
        title: metadata.title,
        category: metadata.category,
        version: metadata.version,
      },
    }))

    // Insert into Pinecone
    const result = await insertDocumentIntoPinecone(
      metadata.documentId,
      metadata.title,
      text,
      {
        title: metadata.title,
        category: metadata.category,
        version: metadata.version,
      },
      chunks,
    )

    return {
      success: true,
      documentId: metadata.documentId,
      chunksProcessed: result.chunksInserted,
      textLength: text.length,
    }
  } catch (error) {
    console.error("Error processing document:", error)
    throw error
  }
}
