// AI SDK for document processing, embeddings, and search

/**
 * @deprecated This file is deprecated and will be removed in the next version.
 * Please use the specialized modules instead:
 * - For embeddings: use lib/ai/embeddings.ts
 * - For search: use lib/ai/hybrid-search.ts
 * - For document processing: use lib/ai/document-processing.ts
 */

import { Pinecone } from "@pinecone-database/pinecone"
import { generateEmbeddings as genEmbed } from "./ai/embeddings"
import { hybridSearch } from "./ai/hybrid-search"
import {
  processDocument as processDoc,
  insertDocumentIntoPinecone,
  deleteDocumentFromPinecone,
} from "./ai/document-processing"
import { getDetailedIndexStats } from "./pinecone/client"

// Use environment variables
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || ""
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || ""
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""

// Initialize Pinecone client
let pineconeClient: Pinecone | null = null

// Get or create Pinecone client
function getPineconeClient() {
  if (!pineconeClient) {
    if (!PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY is not defined")
    }

    pineconeClient = new Pinecone({
      apiKey: PINECONE_API_KEY,
    })
  }
  return pineconeClient
}

// Get Pinecone index
function getPineconeIndex() {
  const pinecone = getPineconeClient()

  if (!PINECONE_INDEX_NAME) {
    throw new Error("PINECONE_INDEX_NAME is not defined")
  }

  return pinecone.Index(PINECONE_INDEX_NAME)
}

// Generate embeddings for a text
export async function generateEmbeddings(text: string): Promise<number[]> {
  console.warn("generateEmbeddings from lib/ai-sdk.ts is deprecated. Please import from lib/ai/embeddings.ts instead.")
  return genEmbed(text)
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
  return hybridSearch(query, filters, limit)
}

// Generate answer from search results
export async function generateAnswerFromResults(query: string, results: any[]) {
  console.warn(
    "generateAnswerFromResults from lib/ai-sdk.ts is deprecated. Please import from lib/ai/generation.ts instead.",
  )

  // Dynamic import to avoid issues with server/client
  const { generateText } = await import("ai")
  const { openai } = await import("@ai-sdk/openai")

  // Prepare context from results
  const context = results
    .map((result, index) => `Document ${index + 1} (${result.title}): ${result.content}`)
    .join("\n\n")

  // Generate answer using OpenAI
  const prompt = `
    You are an assistant for Unreal Engine documentation. Answer the following question based on the provided context.
    If you cannot answer the question based on the context, say "I don't have enough information to answer this question."
    
    Context:
    ${context}
    
    Question: ${query}
    
    Answer:
  `

  const { text } = await generateText({
    model: openai("gpt-4o"),
    prompt: prompt,
    maxTokens: 500,
  })

  return text
}

// Process a document for indexing
export async function processDocument(id: string, title: string, content: string, metadata: Record<string, any> = {}) {
  console.warn(
    "processDocument from lib/ai-sdk.ts is deprecated. Please import from lib/ai/document-processing.ts instead.",
  )
  return processDoc(id, title, content, metadata)
}

export { insertDocumentIntoPinecone, deleteDocumentFromPinecone }

// Mock data flag for testing
export const USE_MOCK_DATA = process.env.USE_MOCK_DATA === "true"
