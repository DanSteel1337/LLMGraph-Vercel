/**
 * Generate embeddings for text using OpenAI
 * @param text Text to embed
 * @returns Embedding vector
 */
export async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    // Dynamic import to avoid issues with server/client
    const { embed } = await import("ai")
    const { openai } = await import("@ai-sdk/openai")

    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: text,
    })

    return embedding
  } catch (error) {
    console.error("Error generating embeddings:", error)
    throw error
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

  console.error("All embedding retries failed:", lastError)
  throw lastError
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
