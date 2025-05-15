import { NextResponse } from "next/server"
import { getPineconeIndex } from "@/lib/pinecone/client"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const category = searchParams.get("category")

    // Get sample vectors from Pinecone
    const index = await getPineconeIndex()

    // Prepare filter if category is specified
    const filter = category ? { metadata: { category: { $eq: category } } } : undefined

    // Query for vectors with values
    const queryResponse = await index.query({
      vector: Array(1536).fill(0), // Zero vector to get random results
      topK: limit,
      includeValues: true,
      includeMetadata: true,
      filter,
    })

    // Extract vectors and metadata
    const vectors =
      queryResponse.matches?.map((match) => ({
        id: match.id,
        vector: match.values,
        metadata: {
          title: match.metadata?.title || "Unknown",
          category: match.metadata?.category || "Uncategorized",
          documentId: match.metadata?.documentId || match.id,
        },
      })) || []

    // For visualization, we need to reduce dimensions
    // In a real implementation, you would use UMAP or t-SNE here
    // For this example, we'll use a simple PCA-like approach
    const reducedVectors = simpleDimensionReduction(vectors)

    return NextResponse.json({
      vectors: reducedVectors,
      totalCount: vectors.length,
    })
  } catch (error) {
    console.error("Error in vector visualization API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

// Simple dimension reduction function
// In production, use a proper algorithm like UMAP or t-SNE
function simpleDimensionReduction(vectors: any[]) {
  return vectors.map((item) => {
    // Extract first two principal components (simplified)
    // In reality, you would use a proper PCA algorithm
    const vec = item.vector || []

    // Simple dimension reduction by summing groups of dimensions
    const groupSize = Math.floor(vec.length / 2)
    const x = vec.slice(0, groupSize).reduce((sum: number, val: number) => sum + val, 0) / groupSize
    const y = vec.slice(groupSize, groupSize * 2).reduce((sum: number, val: number) => sum + val, 0) / groupSize

    return {
      id: item.id,
      x: x * 100 + 300, // Scale for visualization
      y: y * 100 + 200, // Scale for visualization
      metadata: item.metadata,
    }
  })
}
