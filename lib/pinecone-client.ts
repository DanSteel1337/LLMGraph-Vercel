// This file should only be imported in server components or API routes
// It uses Node.js specific modules that won't work in the browser

import { Pinecone } from "@pinecone-database/pinecone"

// Set runtime to nodejs for any file that imports this
export const runtime = "nodejs"

let pineconeClient: Pinecone | null = null

export async function getPineconeClient() {
  // Only create a new client if one doesn't exist
  if (pineconeClient) return pineconeClient

  if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is not defined")
  }

  pineconeClient = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  })

  return pineconeClient
}

export async function getPineconeIndex(indexName?: string) {
  const client = await getPineconeClient()
  const index = client.Index(indexName || process.env.PINECONE_INDEX_NAME || "")

  if (!index) {
    throw new Error(`Pinecone index ${indexName || process.env.PINECONE_INDEX_NAME} not found`)
  }

  return index
}

export async function getIndexStats() {
  const index = await getPineconeIndex()
  return await index.describeIndexStats()
}

export async function querySimilarVectors(vector: number[], topK = 5, filter?: any) {
  try {
    const index = await getPineconeIndex()

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

export async function upsertVectors(vectors: any[]) {
  try {
    const index = await getPineconeIndex()
    await index.upsert(vectors)
    return true
  } catch (error) {
    console.error("Error upserting vectors to Pinecone:", error)
    throw error
  }
}

export async function deleteVectors(ids: string[]) {
  try {
    const index = await getPineconeIndex()
    await index.deleteMany(ids)
    return true
  } catch (error) {
    console.error("Error deleting vectors from Pinecone:", error)
    throw error
  }
}

export async function deleteVectorsByFilter(filter: any) {
  try {
    const index = await getPineconeIndex()
    await index.deleteMany({ filter })
    return true
  } catch (error) {
    console.error("Error deleting vectors by filter from Pinecone:", error)
    throw error
  }
}

export async function getDocumentVectors(documentId: string) {
  try {
    const index = await getPineconeIndex()

    const queryResponse = await index.query({
      filter: { documentId: { $eq: documentId } },
      includeMetadata: true,
      includeValues: true,
      topK: 100,
    })

    return queryResponse.matches || []
  } catch (error) {
    console.error(`Error fetching vectors for document ${documentId}:`, error)
    throw error
  }
}
