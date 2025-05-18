import { generateEmbedding } from "./embeddings"
import { getPineconeIndex } from "@/lib/pinecone/client"
import { buildPineconeFilters } from "@/lib/pinecone/filters"
import { logError } from "@/lib/error-handler"
import { validateEnvVar } from "@/lib/env-validator"
import { shouldUseMockData } from "@/lib/environment"
import { getMockSearchResults } from "@/lib/mock-data"

// Validate required environment variables
validateEnvVar("PINECONE_API_KEY")
validateEnvVar("PINECONE_INDEX_NAME")

// Type for search result
export interface SearchResult {
  id: string
  score: number
  title: string
  content: string
  category: string
  version: string
  documentId: string
  highlights: string[]
  matchType: "vector" | "keyword" | "hybrid"
}

/**
 * Extract keywords from a search query
 * @param query Search query
 * @returns Array of keywords
 */
function extractKeywords(query: string): string[] {
  // Remove stop words and extract meaningful keywords
  const stopWords = [
    "the",
    "a",
    "an",
    "in",
    "on",
    "at",
    "for",
    "with",
    "by",
    "to",
    "and",
    "or",
    "of",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "but",
    "if",
    "then",
    "else",
    "when",
    "up",
    "down",
    "out",
    "in",
    "over",
    "under",
    "again",
  ]

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.includes(word))
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

  // Create a regex that matches the query or any of its keywords
  const keywords = extractKeywords(query)
  const keywordPattern = keywords.map((k) => `\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).join("|")
  const pattern = new RegExp(`(${escapedQuery}|${keywordPattern})`, "gi")

  // Replace matches with highlighted version
  return text.replace(pattern, "<mark>$1</mark>")
}

/**
 * Rerank search results based on relevance to query
 * @param query Search query
 * @param results Search results
 * @returns Reranked results
 */
export function rerank(query: string, results: any[]) {
  // Check if we should use mock data
  if (shouldUseMockData()) {
    console.log("[MOCK] Using mock reranking")
    // Just return the results as is for mock data
    return results
  }

  // Implement reranking logic here
  // This would typically involve:
  // 1. Calculate relevance scores
  // 2. Sort by relevance

  // For now, we'll just return the results as is
  return results
}

/**
 * Perform hybrid search using both vector and keyword search
 * @param query Search query
 * @param filters Optional filters
 * @param options Search options
 * @returns Search results
 */
export async function performHybridSearch(
  query: string,
  filters: Record<string, any> = {},
  options: {
    limit?: number
    vectorWeight?: number
    keywordWeight?: number
  } = {},
) {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      console.log("[MOCK] Using mock search results for hybrid search")
      return {
        results: getMockSearchResults(query, filters),
        isMockData: true,
      }
    }

    // Set default options
    const limit = options.limit || 10
    const vectorWeight = options.vectorWeight || 0.7
    const keywordWeight = options.keywordWeight || 0.3

    // Implement actual hybrid search logic here
    // This would typically involve:
    // 1. Generate embeddings for the query
    // 2. Perform vector search
    // 3. Perform keyword search
    // 4. Combine and rerank results

    // For now, we'll just return a placeholder
    return {
      results: [],
      message: "Hybrid search not implemented yet",
    }
  } catch (error) {
    logError(error, "hybrid_search_error")
    throw new Error(`Hybrid search failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Simple vector search without reranking (for backward compatibility)
 * @param query Search query
 * @param filters Optional filters
 * @param topK Number of results to return
 * @returns Search results
 */
export async function searchSimilarDocuments(
  query: string,
  filters?: Record<string, any>,
  topK = 5,
): Promise<SearchResult[]> {
  console.warn("searchSimilarDocuments is deprecated. Please use hybridSearch instead for better results.")
  try {
    console.log(`Searching for documents similar to: "${query}"`)

    // Generate embedding for the query
    const embedding = await generateEmbedding(query)

    // Get Pinecone index
    const index = getPineconeIndex()

    // Build Pinecone filters
    const pineconeFilters = filters ? buildPineconeFilters(filters) : undefined

    // Query Pinecone
    const results = await index.query({
      vector: embedding,
      topK: topK,
      filter: pineconeFilters,
      includeMetadata: true,
    })

    console.log(`Found ${results.matches?.length || 0} matches in Pinecone`)

    // Process and return results
    return (
      results.matches?.map((match) => ({
        id: match.id,
        score: match.score || 0,
        title: match.metadata?.title || "Untitled Document",
        content: match.metadata?.text || "",
        category: match.metadata?.category || "Uncategorized",
        version: match.metadata?.version || "Unknown",
        documentId: match.metadata?.documentId || match.id,
        highlights: [highlightText(match.metadata?.text as string, query)],
        matchType: "vector",
      })) || []
    )
  } catch (error) {
    // Log the error
    logError(error, "pinecone_search_failure")

    // Return empty results instead of crashing
    console.error("Pinecone search error:", error)
    return []
  }
}

/**
 * Track search query for analytics
 * @param query Search query
 * @param resultCount Number of results
 * @param userId User ID if available
 * @param queryTimeMs Query execution time in milliseconds
 */
export async function trackSearchQuery(query: string, resultCount: number, userId?: string, queryTimeMs?: number) {
  try {
    await fetch("/api/analytics/track-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        resultCount,
        userId,
        queryTimeMs,
      }),
    })
  } catch (error) {
    console.error("Error tracking search query:", error)
    // Non-blocking - don't throw
  }
}

// Add the missing export to fix deployment error
export const searchDocuments = performHybridSearch

/**
 * Performs a search using embeddings
 * @param query The search query
 * @param filters Optional filters to apply to the search
 * @param limit Maximum number of results to return
 * @returns Search results
 */
export async function searchWithEmbeddings(query: string, filters?: Record<string, any>, limit = 10) {
  try {
    // Generate embedding for the query
    const embedding = await generateEmbedding(query)

    // Get Pinecone index
    const index = getPineconeIndex()

    // Build Pinecone filters
    const pineconeFilters = filters ? buildPineconeFilters(filters) : undefined

    // Query Pinecone
    const results = await index.query({
      vector: embedding,
      topK: limit,
      filter: pineconeFilters,
      includeMetadata: true,
    })

    return results.matches || []
  } catch (error) {
    // Log the error
    logError(error, "pinecone_search_failure")

    // Return empty results instead of crashing
    console.error("Pinecone search error:", error)
    return []
  }
}
