import { searchSimilarDocuments } from "@/lib/ai-sdk"
import { logError } from "@/lib/error-handler"

/**
 * Performs a hybrid search using embeddings and keyword matching
 * @param query The search query
 * @param filters Optional filters to apply to the search
 * @returns Search results
 */
export async function performSearch(query: string, filters = {}) {
  try {
    // Use the consolidated AI SDK for embeddings search
    const results = await searchSimilarDocuments(query, filters)

    return {
      results: results.map((match) => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata,
      })),
    }
  } catch (error) {
    logError(error, "hybrid_search_failure")
    return { results: [] }
  }
}

/**
 * Tracks a search query for analytics
 * @param query The search query
 * @param userId Optional user ID
 */
export async function trackSearchQuery(query: string, userId?: string) {
  try {
    const response = await fetch("/api/analytics/track-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, userId }),
    })

    if (!response.ok) {
      throw new Error(`Failed to track search: ${response.status}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error tracking search:", error)
    return { success: false }
  }
}
