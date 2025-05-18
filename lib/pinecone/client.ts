import { Pinecone } from "@pinecone-database/pinecone"
import { validateEnvVar } from "@/lib/env-validator"
import { logError } from "@/lib/error-handler"

// Singleton instance
let pineconeClient: Pinecone | null = null

/**
 * Gets or creates a Pinecone client
 * @returns Pinecone client
 */
export function createClient() {
  if (pineconeClient) {
    return pineconeClient
  }

  try {
    // Get API key with validation
    const apiKey = validateEnvVar("PINECONE_API_KEY")

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
  try {
    const pinecone = createClient()
    const indexName = validateEnvVar("PINECONE_INDEX_NAME")

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
