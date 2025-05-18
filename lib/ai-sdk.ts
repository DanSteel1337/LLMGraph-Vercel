// AI SDK for document processing, embeddings, and search

/**
 * @deprecated This file is deprecated and will be removed in the next version.
 * Please use the specialized modules instead:
 * - For embeddings: use lib/ai/embeddings.ts
 * - For search: use lib/ai/hybrid-search.ts
 * - For document processing: use lib/ai/document-processing.ts
 */

import { generateEmbedding } from "./ai/embeddings"
import { searchWithEmbeddings as hybridSearch } from "./ai/hybrid-search"
import {
  processDocument as processDoc,
  insertDocumentIntoPinecone,
  deleteDocumentFromPinecone,
} from "./ai/document-processing"
import { getDetailedIndexStats } from "./pinecone/client"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { validateEnvVar } from "./env-validator"

// Generate embeddings for a text
export async function generateEmbeddings(text: string): Promise<number[]> {
  console.warn("generateEmbeddings from lib/ai-sdk.ts is deprecated. Please import from lib/ai/embeddings.ts instead.")
  return generateEmbedding(text)
}

// Get Pinecone stats
export async function getPineconeStats() {
  console.warn(
    "getPineconeStats from lib/ai-sdk.ts is deprecated. Please import getDetailedIndexStats from lib/pinecone/client.ts instead.",
  )
  return getDetailedIndexStats()
}

// Search for similar documents
export async function searchSimilarDocuments(query: string, filters?: Record<string, any>, limit = 5) {
  console.warn(
    "searchSimilarDocuments from lib/ai-sdk.ts is deprecated. Please import hybridSearch from lib/ai/hybrid-search.ts instead.",
  )
  return hybridSearch(query, filters)
}

// Generate answer from search results
export async function generateAnswerFromResults(query: string, results: any[]) {
  console.warn(
    "generateAnswerFromResults from lib/ai-sdk.ts is deprecated. Please import from lib/ai/generation.ts instead.",
  )

  // Prepare context from results
  const context = results
    .map((result, index) => `Document ${index + 1} (${result.title}): ${result.content}`)
    .join("\n\n")

  // Generate answer using OpenAI
  return generateResponse(query, context)
}

// Process a document for indexing
export async function processDocument(id: string, title: string, content: string, metadata: Record<string, any> = {}) {
  console.warn(
    "processDocument from lib/ai-sdk.ts is deprecated. Please import from lib/ai/document-processing.ts instead.",
  )
  return processDoc(id, title, content, metadata)
}

export { insertDocumentIntoPinecone, deleteDocumentFromPinecone }

// Centralized AI functionality
async function generateResponse(prompt: string, context: string) {
  // Validate OpenAI API key
  validateEnvVar("OPENAI_API_KEY")

  const { text } = await generateText({
    model: openai("gpt-4o"),
    prompt: `Context: ${context}\n\nQuestion: ${prompt}\n\nAnswer:`,
    maxTokens: 500,
  })

  return text
}
