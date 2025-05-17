/**
 * @deprecated This file is deprecated and will be removed in the next version.
 * Please use lib/ai/hybrid-search.ts instead for search functionality.
 */

import { searchSimilarDocuments as search, highlightText as highlight } from "./hybrid-search"

// Re-export the functions from the new module with warnings
export async function searchSimilarDocuments(query: string, filters?: Record<string, any>, topK = 5): Promise<any[]> {
  console.warn(
    "searchSimilarDocuments from lib/ai/search.ts is deprecated. Please use hybridSearch from lib/ai/hybrid-search.ts instead.",
  )
  return search(query, filters, topK)
}

export function highlightText(text: string, query: string): string {
  console.warn(
    "highlightText from lib/ai/search.ts is deprecated. Please use highlightText from lib/ai/hybrid-search.ts instead.",
  )
  return highlight(text, query)
}
