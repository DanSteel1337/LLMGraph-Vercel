import { embedWithRetry } from "./embeddings"
import { querySimilarVectors } from "../pinecone/client"
import { createCategoryFilter, combineFilters } from "../pinecone/filters"

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
function highlightText(text: string, query: string): string {
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
 * Rerank search results using keyword matching
 * @param matches Vector search matches
 * @param keywords Keywords from the query
 * @param originalQuery Original search query
 * @returns Reranked search results
 */
function rerank(matches: any[], keywords: string[], originalQuery: string): any[] {
  return matches
    .map((match) => {
      const text = match.metadata?.text || ""
      const title = match.metadata?.title || ""

      // Count keyword occurrences
      let keywordMatches = 0
      keywords.forEach((keyword) => {
        const regex = new RegExp(keyword, "gi")
        const textMatches = (text.match(regex) || []).length
        const titleMatches = (title.match(regex) || []).length
        keywordMatches += textMatches + titleMatches * 2 // Title matches count double
      })

      // Exact phrase match bonus
      const exactMatch = text.toLowerCase().includes(originalQuery.toLowerCase())
      const exactMatchBonus = exactMatch ? 0.2 : 0

      // Combine vector similarity with keyword matching
      const vectorScore = match.score || 0
      const keywordScore = keywordMatches * 0.05 // Each keyword match adds 0.05
      const combinedScore = vectorScore * 0.7 + keywordScore + exactMatchBonus

      return {
        ...match,
        score: combinedScore,
        matchType: keywordMatches > 0 ? "hybrid" : "vector",
      }
    })
    .sort((a, b) => b.score - a.score)
}

/**
 * Perform hybrid search combining vector similarity and keyword matching
 * @param query Search query
 * @param filters Optional filters
 * @param topK Number of results to return
 * @returns Search results
 */
export async function hybridSearch(
  query: string,
  filters: Record<string, any> = {},
  topK = 10,
): Promise<SearchResult[]> {
  try {
    console.log(`Performing hybrid search for: "${query}"`)

    // Generate embedding for vector search
    const embedding = await embedWithRetry(query)

    // Prepare filter
    const categoryFilter = filters.categories ? createCategoryFilter(filters.categories) : {}
    const combinedFilter = combineFilters([categoryFilter, filters.custom || {}])

    // Get more results than needed for reranking
    const vectorResults = await querySimilarVectors(embedding, topK * 2, combinedFilter)

    // Extract keywords for text matching
    const keywords = extractKeywords(query)

    // Rerank results using keyword matching
    const rerankedResults = rerank(vectorResults.matches || [], keywords, query)

    // Return top K results after reranking
    return rerankedResults.slice(0, topK).map((match) => ({
      id: match.id,
      score: match.score,
      title: match.metadata?.title || "Untitled Document",
      content: match.metadata?.text || "",
      category: match.metadata?.category || "Uncategorized",
      version: match.metadata?.version || "Unknown",
      documentId: match.metadata?.documentId || match.id,
      highlights: [highlightText(match.metadata?.text as string, query)],
      matchType: match.matchType,
    }))
  } catch (error) {
    console.error("Error performing hybrid search:", error)
    throw error
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
