/**
 * Search Module
 *
 * Provides utilities for performing semantic search operations and tracking search queries.
 * Integrates with the AI SDK for embeddings-based search.
 *
 * @module search
 */

import { logError } from "./error-handler"
import { shouldUseMockData } from "./environment"
import { getMockSearchResults } from "./mock-data"

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
 * Search for similar documents using embeddings
 * @param query The search query
 * @param filters Optional filters to apply to the search
 * @returns Array of matching documents with scores
 */
export async function searchSimilarDocuments(query: string, filters = {}) {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      console.log("[MOCK] Using mock search results")
      const mockResults = getMockSearchResults(query, filters)
      return mockResults.results.map((result) => ({
        id: result.id,
        score: result.score,
        metadata: result.metadata,
        content: result.content,
      }))
    }

    // In a real implementation, this would:
    // 1. Generate embeddings for the query
    // 2. Search Pinecone for similar vectors
    // 3. Process and return the results

    // This is a placeholder for the actual implementation
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, filters }),
    })

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`)
    }

    const data = await response.json()
    return data.results
  } catch (error) {
    logError(error, "search_similar_documents_failure")
    return []
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
