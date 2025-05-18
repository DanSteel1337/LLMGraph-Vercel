import { Pinecone } from "@pinecone-database/pinecone"
import { logError } from "@/lib/error-handler"

// Singleton instance
let pineconeClient: Pinecone | null = null

// Development fallbacks
const DEV_FALLBACKS = {
  PINECONE_API_KEY: "dev-api-key",
  PINECONE_INDEX_NAME: "dev-index",
  PINECONE_INDEX_TYPE: "serverless",
}

/**
 * Gets or creates a Pinecone client
 * @returns Pinecone client
 */
export function createClient() {
  if (pineconeClient) {
    return pineconeClient
  }

  const isDev = process.env.NODE_ENV === "development"

  // Get API key with development fallback
  const apiKey = process.env.PINECONE_API_KEY || (isDev ? DEV_FALLBACKS.PINECONE_API_KEY : "")

  if (!apiKey) {
    throw new Error("PINECONE_API_KEY is not defined")
  }

  try {
    pineconeClient = new Pinecone({
      apiKey,
    })

    return pineconeClient
  } catch (error) {
    logError(error, "pinecone_client_creation_error")
    throw new Error(`Failed to create Pinecone client: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Gets a Pinecone index
 * @returns Pinecone index
 */
export function getPineconeIndex() {
  const pinecone = createClient()
  const isDev = process.env.NODE_ENV === "development"

  // Get index name with development fallback
  const indexName = process.env.PINECONE_INDEX_NAME || (isDev ? DEV_FALLBACKS.PINECONE_INDEX_NAME : "")

  if (!indexName) {
    throw new Error("PINECONE_INDEX_NAME is not defined")
  }

  try {
    return pinecone.Index(indexName)
  } catch (error) {
    logError(error, "pinecone_index_access_error")
    throw new Error(`Failed to access Pinecone index: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Gets detailed stats for a Pinecone index
 * @returns Index stats
 */
export async function getDetailedIndexStats() {
  try {
    const index = getPineconeIndex()
    const stats = await index.describeIndexStats()
    return stats
  } catch (error) {
    logError(error, "pinecone_stats_error")
    console.error("Error getting Pinecone stats:", error)
    return null
  }
}
