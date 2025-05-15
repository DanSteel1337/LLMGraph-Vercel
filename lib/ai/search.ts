import { embedWithRetry } from "./embeddings"
import { querySimilarVectors } from "../pinecone/client"
import { highlightText } from "./embeddings"

// Search for similar documents
export async function searchSimilarDocuments(query: string, filters?: Record<string, any>, topK = 5): Promise<any[]> {
  try {
    console.log(`Searching for documents similar to: "${query}"`)

    // Generate embedding for the query
    const embedding = await embedWithRetry(query)

    // Prepare filter if provided
    const filterObj = filters ? { metadata: filters } : undefined

    // Query Pinecone
    const results = await querySimilarVectors(embedding, topK, filterObj)

    console.log(`Found ${results.matches?.length || 0} matches in Pinecone`)

    // Process and return results
    return (
      results.matches?.map((match) => ({
        id: match.id,
        score: match.score,
        title: match.metadata?.title || "Untitled Document",
        content: match.metadata?.text || "",
        category: match.metadata?.category || "Uncategorized",
        version: match.metadata?.version || "Unknown",
        documentId: match.metadata?.documentId || match.id,
        highlights: [highlightText(match.metadata?.text as string, query)],
      })) || []
    )
  } catch (error) {
    console.error("Error searching documents:", error)
    throw error
  }
}
