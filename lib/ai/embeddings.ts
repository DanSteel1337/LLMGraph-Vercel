import { validateEnvVar } from "@/lib/env-validator"
import { logError } from "@/lib/error-handler"
import { shouldUseMockData } from "@/lib/environment"
import { getMockEmbeddings } from "@/lib/mock-data"

/**
 * Generate embeddings for text using OpenAI
 * @param text Text to embed
 * @returns Embedding vector
 */
export async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      console.log("[MOCK] Using mock embeddings")
      return getMockEmbeddings(text)
    }

    // Validate OpenAI API key
    validateEnvVar("OPENAI_API_KEY")

    // Dynamic import to avoid issues with server/client
    const { embed } = await import("ai")
    const { openai } = await import("@ai-sdk/openai")

    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: text,
    })

    return embedding
  } catch (error) {
    logError(error, "embedding_generation_error")
    throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Generate embeddings with retry logic
 * @param text Text to embed
 * @param maxRetries Maximum number of retries
 * @returns Embedding vector
 */
export async function embedWithRetry(text: string, maxRetries = 3): Promise<number[]> {
  let retries = 0
  let lastError: any = null

  // If using mock data, return mock embeddings immediately without retries
  if (shouldUseMockData()) {
    console.log("[MOCK] Using mock embeddings (no retry needed)")
    return getMockEmbeddings(text)
  }

  while (retries < maxRetries) {
    try {
      return await generateEmbeddings(text)
    } catch (error) {
      lastError = error
      retries++
      console.warn(`Embedding generation failed, retry ${retries}/${maxRetries}`)
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries)))
    }
  }

  logError(lastError, "embedding_retry_exhausted")
  throw new Error(
    `Embedding generation failed after ${maxRetries} retries: ${
      lastError instanceof Error ? lastError.message : "Unknown error"
    }`,
  )
}

/**
 * Highlight text with search query
 * @param text Text to highlight
 * @param query Search query
 * @returns Highlighted text with <mark> tags
 */
export function highlightText(text: string, query: string): string {
  if (!text) return ""

  // Escape special regex characters in the query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  // Create a regex that matches the query
  const pattern = new RegExp(`(${escapedQuery})`, "gi")

  // Replace matches with highlighted version
  return text.replace(pattern, "<mark>$1</mark>")
}

/**
 * Generate embedding for a single text
 * Alias for generateEmbeddings for backward compatibility
 * @param text Text to embed
 * @returns Embedding vector
 */
export const generateEmbedding = generateEmbeddings
