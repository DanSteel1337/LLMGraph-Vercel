import { Pinecone } from "@pinecone-database/pinecone"

// Create a Pinecone client with the given API key
export function createPineconeClient(apiKey?: string) {
  const key = apiKey || process.env.PINECONE_API_KEY

  if (!key) {
    throw new Error("PINECONE_API_KEY is not defined")
  }

  return new Pinecone({
    apiKey: key,
  })
}

// Get a Pinecone index with the given name
export function getPineconeIndex(indexName?: string, client?: Pinecone) {
  const name = indexName || process.env.PINECONE_INDEX_NAME

  if (!name) {
    throw new Error("PINECONE_INDEX_NAME is not defined")
  }

  const pinecone = client || createPineconeClient()
  return pinecone.Index(name)
}

// Get stats from a Pinecone index
export async function getPineconeStats(indexName?: string, client?: Pinecone) {
  try {
    const index = getPineconeIndex(indexName, client)
    const stats = await index.describeIndexStats()

    return {
      vectorCount: stats.totalVectorCount,
      dimensions: stats.dimension || 0,
      indexName: indexName || process.env.PINECONE_INDEX_NAME || "unknown",
    }
  } catch (error) {
    console.error("Error getting Pinecone stats:", error)
    throw error
  }
}

// Query Pinecone for similar vectors
export async function querySimilarVectors(
  vector: number[],
  topK = 5,
  filter?: any,
  indexName?: string,
  client?: Pinecone,
) {
  try {
    const index = getPineconeIndex(indexName, client)

    const results = await index.query({
      vector,
      topK,
      includeMetadata: true,
      filter,
    })

    return results
  } catch (error) {
    console.error("Error querying Pinecone:", error)
    throw error
  }
}

// Upsert vectors to Pinecone
export async function upsertVectors(vectors: any[], indexName?: string, client?: Pinecone) {
  try {
    const index = getPineconeIndex(indexName, client)
    await index.upsert(vectors)
    return true
  } catch (error) {
    console.error("Error upserting vectors to Pinecone:", error)
    throw error
  }
}

// Delete vectors from Pinecone
export async function deleteVectors(ids: string[], indexName?: string, client?: Pinecone) {
  try {
    const index = getPineconeIndex(indexName, client)
    await index.deleteMany(ids)
    return true
  } catch (error) {
    console.error("Error deleting vectors from Pinecone:", error)
    throw error
  }
}

// Delete vectors by filter
export async function deleteVectorsByFilter(filter: any, indexName?: string, client?: Pinecone) {
  try {
    const index = getPineconeIndex(indexName, client)
    await index.deleteMany({ filter })
    return true
  } catch (error) {
    console.error("Error deleting vectors by filter from Pinecone:", error)
    throw error
  }
}
