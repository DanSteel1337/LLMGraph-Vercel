/**
 * Pinecone Client Module
 *
 * Provides utilities for interacting with Pinecone vector database,
 * including client initialization, index management, and connection checking.
 * Includes mock implementations for development environments.
 *
 * @module pinecone/client
 */

import { Pinecone } from "@pinecone-database/pinecone"
import { logError } from "../error-handler"
import { validateEnvVar } from "../env-validator"
import { shouldUseMockData } from "../environment"
import { getMockPineconeQueryResponse } from "../mock-data"

// Singleton instance
let pineconeInstance: Pinecone | null = null

/**
 * Initialize Pinecone client
 * @returns Pinecone client instance
 */
export function initPinecone() {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      console.log("[MOCK] Using mock Pinecone client")
      return createMockPineconeClient()
    }

    // Validate environment variables
    validateEnvVar("PINECONE_API_KEY")
    const apiKey = process.env.PINECONE_API_KEY as string

    // Create Pinecone client
    return new Pinecone({
      apiKey,
    })
  } catch (error) {
    logError(error, "pinecone_init_error")
    throw new Error(`Failed to initialize Pinecone: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Create a Pinecone client
 * @returns Pinecone client instance
 */
export function createClient() {
  return initPinecone()
}

/**
 * Get Pinecone client (singleton)
 * @returns Pinecone client instance
 */
export function getPineconeClient() {
  if (!pineconeInstance) {
    pineconeInstance = initPinecone()
  }
  return pineconeInstance
}

/**
 * Get Pinecone index
 * @param indexName Index name (optional, defaults to environment variable)
 * @returns Pinecone index
 */
export function getPineconeIndex(indexName?: string) {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      console.log("[MOCK] Using mock Pinecone index")
      return createMockPineconeIndex()
    }

    // Get index name from environment variable if not provided
    const actualIndexName = indexName || process.env.PINECONE_INDEX_NAME
    if (!actualIndexName) {
      throw new Error("Pinecone index name not provided and PINECONE_INDEX_NAME environment variable not set")
    }

    // Get Pinecone client
    const client = getPineconeClient()

    // Get index
    return client.index(actualIndexName)
  } catch (error) {
    logError(error, "pinecone_index_error")
    throw new Error(`Failed to get Pinecone index: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Create a mock Pinecone client for development
 * @returns Mock Pinecone client
 */
function createMockPineconeClient() {
  return {
    index: (indexName: string) => createMockPineconeIndex(),
  } as unknown as Pinecone
}

/**
 * Create a mock Pinecone index for development
 * @returns Mock Pinecone index
 */
function createMockPineconeIndex() {
  return {
    namespace: (namespace: string) => ({
      query: async (params: any) => getMockPineconeQueryResponse(params),
      upsert: async (params: any) => ({ upsertedCount: params.vectors.length }),
      delete: async (params: any) => ({ deletedCount: 1 }),
    }),
    query: async (params: any) => getMockPineconeQueryResponse(params),
    upsert: async (params: any) => ({ upsertedCount: params.vectors.length }),
    delete: async (params: any) => ({ deletedCount: 1 }),
  }
}

/**
 * Check Pinecone connection
 * @returns Connection status
 */
export async function checkPineconeConnection() {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      console.log("[MOCK] Using mock Pinecone connection check")
      return {
        status: "connected",
        message: "Mock Pinecone connection successful",
        isMockData: true,
      }
    }

    // Get Pinecone client
    const client = getPineconeClient()

    // List indexes to check connection
    const indexes = await client.listIndexes()

    return {
      status: "connected",
      message: "Pinecone connection successful",
      indexes: indexes.map((index) => index.name),
    }
  } catch (error) {
    logError(error, "pinecone_connection_error")
    return {
      status: "error",
      message: `Failed to connect to Pinecone: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

/**
 * Get detailed index statistics
 * @param indexName Index name (optional, defaults to environment variable)
 * @returns Index statistics
 */
export async function getDetailedIndexStats(indexName?: string) {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      return {
        vectorCount: 3750,
        dimensions: 1536,
        indexName: indexName || "mock-index",
        isMockData: true,
      }
    }

    // Get Pinecone index
    const index = getPineconeIndex(indexName)

    // Get index stats
    const stats = await index.describeIndexStats()

    return {
      vectorCount: stats.totalVectorCount,
      dimensions: stats.dimension,
      indexName: indexName || process.env.PINECONE_INDEX_NAME,
    }
  } catch (error) {
    logError(error, "pinecone_stats_error")
    return {
      error: `Failed to get index stats: ${error instanceof Error ? error.message : "Unknown error"}`,
      vectorCount: 0,
      dimensions: 0,
      indexName: indexName || "unknown",
    }
  }
}
