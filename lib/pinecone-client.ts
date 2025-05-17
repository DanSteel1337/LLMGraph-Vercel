/**
 * @deprecated This file is deprecated and will be removed in the next version.
 * Please use lib/pinecone/client.ts instead for Pinecone client functionality.
 */

import {
  getPineconeClient as getClient,
  getPineconeIndex as getIndex,
  getIndexStats as getStats,
  querySimilarVectors as queryVectors,
  upsertVectors as upsert,
  deleteVectors as deleteV,
  deleteVectorsByFilter as deleteByFilter,
  getDocumentVectors as getDocVectors,
} from "./pinecone/client"

// Re-export the functions from the new module with warnings
export async function getPineconeClient() {
  console.warn(
    "getPineconeClient from lib/pinecone-client.ts is deprecated. Please import from lib/pinecone/client.ts instead.",
  )
  return getClient()
}

export async function getPineconeIndex(indexName?: string) {
  console.warn(
    "getPineconeIndex from lib/pinecone-client.ts is deprecated. Please import from lib/pinecone/client.ts instead.",
  )
  return getIndex(indexName)
}

export async function getIndexStats() {
  console.warn(
    "getIndexStats from lib/pinecone-client.ts is deprecated. Please import from lib/pinecone/client.ts instead.",
  )
  return getStats()
}

export async function querySimilarVectors(vector: number[], topK = 5, filter?: any) {
  console.warn(
    "querySimilarVectors from lib/pinecone-client.ts is deprecated. Please import from lib/pinecone/client.ts instead.",
  )
  return queryVectors(vector, topK, filter)
}

export async function upsertVectors(vectors: any[]) {
  console.warn(
    "upsertVectors from lib/pinecone-client.ts is deprecated. Please import from lib/pinecone/client.ts instead.",
  )
  return upsert(vectors)
}

export async function deleteVectors(ids: string[]) {
  console.warn(
    "deleteVectors from lib/pinecone-client.ts is deprecated. Please import from lib/pinecone/client.ts instead.",
  )
  return deleteV(ids)
}

export async function deleteVectorsByFilter(filter: any) {
  console.warn(
    "deleteVectorsByFilter from lib/pinecone-client.ts is deprecated. Please import from lib/pinecone/client.ts instead.",
  )
  return deleteByFilter(filter)
}

export async function getDocumentVectors(documentId: string) {
  console.warn(
    "getDocumentVectors from lib/pinecone-client.ts is deprecated. Please import from lib/pinecone/client.ts instead.",
  )
  return getDocVectors(documentId)
}

// Set runtime to nodejs for any file that imports this
export const runtime = "nodejs"
