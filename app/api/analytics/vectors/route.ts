import { NextResponse } from "next/server"
import { getPineconeIndex } from "@/lib/pinecone/client"
import { shouldUseMockData } from "@/lib/environment"

export const runtime = "edge"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    // Check if we should use mock data
    if (shouldUseMockData()) {
      // Generate mock vector data
      const mockVectors = Array.from({ length: 50 }, (_, i) => {
        const categories = ["API", "Guide", "Tutorial", "Other"]
        const randomCategory = categories[Math.floor(Math.random() * categories.length)]

        // Only include vectors matching the requested category, if specified
        if (category && category !== "all" && randomCategory !== category) {
          return null
        }

        return {
          id: `vector-${i}`,
          x: Math.random() * 600,
          y: Math.random() * 400,
          metadata: {
            title: `Document ${i}`,
            category: randomCategory,
            version: `5.${Math.floor(Math.random() * 3)}`,
          },
        }
      }).filter(Boolean)

      return NextResponse.json({
        vectors: mockVectors,
        isMockData: true,
      })
    }

    // Get real vector data from Pinecone
    // This is a simplified example - in reality, you would need to:
    // 1. Query vectors from Pinecone
    // 2. Apply dimensionality reduction (e.g., t-SNE, UMAP) to project to 2D
    // 3. Return the projected vectors with metadata

    const pineconeIndex = getPineconeIndex()

    // Query vectors with optional category filter
    const filter = category && category !== "all" ? { category: { $eq: category } } : undefined

    const queryResponse = await pineconeIndex.query({
      topK: 100,
      includeMetadata: true,
      filter,
      // This is just a placeholder vector - in reality you'd use a more sophisticated approach
      vector: Array(1536).fill(0),
    })

    // Process and project vectors (simplified)
    // In a real implementation, you'd use a proper dimensionality reduction algorithm
    const vectors =
      queryResponse.matches?.map((match, i) => ({
        id: match.id,
        x: Math.random() * 600, // Placeholder for actual projection
        y: Math.random() * 400, // Placeholder for actual projection
        metadata: match.metadata,
      })) || []

    return NextResponse.json({ vectors })
  } catch (error) {
    console.error("Vector visualization API error:", error)
    return NextResponse.json({ error: "Failed to fetch vector data" }, { status: 500 })
  }
}
