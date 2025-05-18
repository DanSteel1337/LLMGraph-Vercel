/**
 * Mock Data Module
 *
 * Provides mock data for development and testing environments.
 * Used when running in development mode, in preview deployments,
 * or as fallbacks when API calls fail.
 *
 * @module mock-data
 */

// Mock stats data
export const MOCK_STATS = {
  totalDocuments: 125,
  totalSearches: 1842,
  totalFeedback: 37,
  vectorCount: 3750,
  dimensions: 1536,
  indexName: "unreal-docs",
}

// Mock system status data
export const MOCK_SYSTEM_STATUS = {
  database: {
    status: "healthy",
    message: "Connected to Supabase",
    latency: 45,
  },
  vectorStore: {
    status: "healthy",
    message: "Connected to Pinecone",
    latency: 120,
  },
  openai: {
    status: "healthy",
    message: "Connected to OpenAI API",
    latency: 350,
  },
  storage: {
    status: "healthy",
    message: "Connected to Supabase Storage",
    latency: 65,
  },
  isMockData: true,
}

// Mock search trends data
export const MOCK_SEARCH_TRENDS = [
  { date: "2023-05-01", searches: 45, successRate: 82 },
  { date: "2023-05-02", searches: 52, successRate: 78 },
  { date: "2023-05-03", searches: 61, successRate: 85 },
  { date: "2023-05-04", searches: 48, successRate: 79 },
  { date: "2023-05-05", searches: 64, successRate: 88 },
  { date: "2023-05-06", searches: 57, successRate: 84 },
  { date: "2023-05-07", searches: 68, successRate: 91 },
]

// Mock popular searches
export const MOCK_POPULAR_SEARCHES = [
  { query: "blueprints", count: 120 },
  { query: "materials", count: 95 },
  { query: "animation", count: 87 },
  { query: "lighting", count: 76 },
  { query: "physics", count: 65 },
]

// Mock documents
export const MOCK_DOCUMENTS = [
  {
    id: "doc-1",
    title: "Getting Started with Unreal Engine",
    description: "A beginner's guide to Unreal Engine development",
    category: "Tutorials",
    version: "5.1",
    createdAt: "2023-04-15T10:30:00Z",
    updatedAt: "2023-04-15T10:30:00Z",
    status: "published",
    pageCount: 12,
  },
  {
    id: "doc-2",
    title: "Blueprint Visual Scripting",
    description: "Learn how to create gameplay mechanics without coding",
    category: "Programming",
    version: "5.1",
    createdAt: "2023-04-10T14:20:00Z",
    updatedAt: "2023-04-12T09:15:00Z",
    status: "published",
    pageCount: 28,
  },
  {
    id: "doc-3",
    title: "Material System Overview",
    description: "Understanding Unreal Engine's material system",
    category: "Graphics",
    version: "5.0",
    createdAt: "2023-03-22T11:45:00Z",
    updatedAt: "2023-03-25T16:30:00Z",
    status: "published",
    pageCount: 18,
  },
]

// Mock search results
export const MOCK_SEARCH_RESULTS = [
  {
    id: "chunk-1",
    title: "Blueprint Visual Scripting",
    content:
      "Blueprints Visual Scripting is a complete gameplay scripting system based on the concept of using a node-based interface to create gameplay elements from within Unreal Editor. As with many common scripting languages, it is used to define object-oriented (OO) classes or objects in the engine.",
    score: 0.92,
    metadata: {
      source: "Blueprint Documentation",
      page: 1,
      category: "Programming",
      version: "5.1",
    },
  },
  {
    id: "chunk-2",
    title: "Blueprint Classes",
    content:
      "Blueprint Classes are ideal for making interactive assets such as doors, switches, collectible items, and destructible scenery. In the image below, you can see how a Blueprint can be used to create a door asset that automatically opens when a player approaches it.",
    score: 0.85,
    metadata: {
      source: "Blueprint Documentation",
      page: 3,
      category: "Programming",
      version: "5.1",
    },
  },
  {
    id: "chunk-3",
    title: "Blueprint Interface",
    content:
      "The Blueprint interface allows designers and gameplay programmers to leverage the power of Unreal Engine's C++ implementation in a visual, node-based environment. This system is extremely flexible and powerful as it provides the ability for designers to use virtually the full range of concepts and tools generally only available to programmers.",
    score: 0.78,
    metadata: {
      source: "Blueprint Documentation",
      page: 2,
      category: "Programming",
      version: "5.1",
    },
  },
]

// Mock feedback data
export const MOCK_FEEDBACK = [
  {
    id: "feedback-1",
    query: "how to create blueprints",
    resultId: "chunk-1",
    isPositive: true,
    timestamp: "2023-05-01T14:30:00Z",
    userId: "user-1",
  },
  {
    id: "feedback-2",
    query: "material system",
    resultId: "chunk-3",
    isPositive: false,
    timestamp: "2023-05-02T09:15:00Z",
    userId: "user-2",
  },
  {
    id: "feedback-3",
    query: "blueprint interface",
    resultId: "chunk-2",
    isPositive: true,
    timestamp: "2023-05-03T16:45:00Z",
    userId: "user-3",
  },
]

// Mock category distribution
export const MOCK_CATEGORY_DISTRIBUTION = [
  { category: "Programming", count: 45 },
  { category: "Graphics", count: 32 },
  { category: "Tutorials", count: 28 },
  { category: "Animation", count: 19 },
  { category: "Audio", count: 12 },
  { category: "Physics", count: 9 },
  { category: "Networking", count: 7 },
]

/**
 * Helper function to ensure array return type
 * @param data Data that might be an array, a single item, or null/undefined
 * @param fallback Fallback array to return if data is empty
 * @returns Ensured array
 */
export function ensureArray<T>(data: T | T[] | null | undefined, fallback: T[] = []): T[] {
  if (Array.isArray(data)) {
    return data.length > 0 ? data : fallback
  }
  return data ? [data] : fallback
}

/**
 * Helper function to ensure object return type
 * @param data Data that might be an object or null/undefined
 * @param fallback Fallback object to return if data is null/undefined
 * @returns Ensured object
 */
export function ensureObject<T extends object>(data: T | null | undefined, fallback: T): T {
  return data || fallback
}

/**
 * Get mock categories for document filtering
 * @returns Array of category objects
 */
export function getMockCategories() {
  return [
    { id: "programming", name: "Programming" },
    { id: "graphics", name: "Graphics" },
    { id: "tutorials", name: "Tutorials" },
    { id: "animation", name: "Animation" },
    { id: "audio", name: "Audio" },
    { id: "physics", name: "Physics" },
    { id: "networking", name: "Networking" },
  ]
}

/**
 * Get mock versions for document filtering
 * @returns Array of version objects
 */
export function getMockVersions() {
  return [
    { id: "5.1", name: "5.1" },
    { id: "5.0", name: "5.0" },
    { id: "4.27", name: "4.27" },
    { id: "4.26", name: "4.26" },
  ]
}

/**
 * Get mock document chunks
 * @param documentId Optional document ID to filter chunks
 * @returns Array of document chunks
 */
export function getMockChunks(documentId?: string) {
  const allChunks = [
    {
      id: "chunk-1",
      documentId: "doc-1",
      content: "Introduction to Unreal Engine development environment and basic concepts.",
      pageNumber: 1,
      embedding: new Array(1536).fill(0).map(() => Math.random() * 2 - 1),
    },
    {
      id: "chunk-2",
      documentId: "doc-2",
      content: "Blueprint Visual Scripting overview and core concepts.",
      pageNumber: 1,
      embedding: new Array(1536).fill(0).map(() => Math.random() * 2 - 1),
    },
    {
      id: "chunk-3",
      documentId: "doc-3",
      content: "Material system architecture and shader compilation pipeline.",
      pageNumber: 1,
      embedding: new Array(1536).fill(0).map(() => Math.random() * 2 - 1),
    },
  ]

  if (documentId) {
    return allChunks.filter((chunk) => chunk.documentId === documentId)
  }

  return allChunks
}

/**
 * Get mock embeddings for text
 * @param text Text to generate embeddings for
 * @returns Mock embedding vector
 */
export function getMockEmbeddings(text: string) {
  // Generate deterministic but random-looking embedding based on text
  const seed = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (n: number) => {
    const x = Math.sin(n + seed) * 10000
    return x - Math.floor(x)
  }

  return {
    embedding: new Array(1536).fill(0).map((_, i) => random(i) * 2 - 1),
    usage: {
      prompt_tokens: text.length,
      total_tokens: text.length,
    },
  }
}

/**
 * Get mock generated answer for RAG
 * @param query User query
 * @param context Context from retrieved documents
 * @returns Generated answer with metadata
 */
export function getMockGeneratedAnswer(query: string, context: string[]) {
  return {
    answer: `Here's information about ${query}: ${context[0]?.substring(0, 100)}...`,
    sources: [
      { id: "chunk-1", title: "Blueprint Visual Scripting", score: 0.92 },
      { id: "chunk-2", title: "Blueprint Classes", score: 0.85 },
    ],
    usage: {
      prompt_tokens: query.length + context.join("").length,
      completion_tokens: 150,
      total_tokens: query.length + context.join("").length + 150,
    },
  }
}

/**
 * Get mock document summary
 * @param documentId Document ID
 * @returns Document summary
 */
export function getMockDocumentSummary(documentId: string) {
  const document = MOCK_DOCUMENTS.find((doc) => doc.id === documentId)

  return {
    id: documentId,
    title: document?.title || "Unknown Document",
    summary: `This document covers ${document?.description || "various topics"} in detail.`,
    keyPoints: [
      "Introduction to core concepts",
      "Detailed implementation guide",
      "Best practices and optimization tips",
      "Common troubleshooting scenarios",
    ],
    pageCount: document?.pageCount || 10,
    wordCount: (document?.pageCount || 10) * 500,
    createdAt: document?.createdAt || new Date().toISOString(),
  }
}

/**
 * Get mock search results
 * @param query Search query
 * @param filters Optional search filters
 * @returns Search results with metadata
 */
export function getMockSearchResults(query: string, filters = {}) {
  return {
    results: MOCK_SEARCH_RESULTS,
    metadata: {
      query,
      filters,
      totalResults: MOCK_SEARCH_RESULTS.length,
      processingTimeMs: 120,
      isMockData: true,
    },
  }
}

/**
 * Mock function for Pinecone query responses
 * @param params Query parameters
 * @returns Mock query response
 */
export function getMockPineconeQueryResponse(params: any) {
  return {
    matches: MOCK_SEARCH_RESULTS.map((result, index) => ({
      id: result.id,
      score: result.score,
      metadata: {
        ...result.metadata,
        text: result.content,
      },
    })),
    namespace: "",
  }
}
