import { openai } from "@ai-sdk/openai"

export const runtime = "nodejs"

export async function generateEmbedding(text: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not defined")
  }

  try {
    // Use the embeddings method directly from the openai client
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    })

    return response.data[0].embedding
  } catch (error) {
    console.error("Error generating embedding:", error)
    throw error
  }
}

export async function generateEmbeddings(texts: string[]) {
  return Promise.all(texts.map((text) => generateEmbedding(text)))
}

// Add the missing embedWithRetry function
export async function embedWithRetry(text: string, maxRetries = 3) {
  let retries = 0
  let lastError

  while (retries < maxRetries) {
    try {
      return await generateEmbedding(text)
    } catch (error) {
      lastError = error
      retries++
      console.warn(`Embedding generation failed, attempt ${retries}/${maxRetries}`, error)

      // Wait before retrying (exponential backoff)
      if (retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)))
      }
    }
  }

  console.error(`Failed to generate embedding after ${maxRetries} attempts`)
  throw lastError
}

// Add the missing highlightText function that's imported in search.ts
export function highlightText(text: string, query: string): string {
  if (!text) return ""

  try {
    // Escape special regex characters in the query
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

    // Create a regex that matches the query
    const regex = new RegExp(`(${escapedQuery})`, "gi")

    // Replace matches with highlighted version
    return text.replace(regex, "<mark>$1</mark>")
  } catch (error) {
    console.error("Error highlighting text:", error)
    return text
  }
}
