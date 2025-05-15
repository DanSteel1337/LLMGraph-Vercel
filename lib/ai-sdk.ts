// AI SDK for document processing, embeddings, and search
import { Pinecone } from "@pinecone-database/pinecone"

// Use environment variables
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || ""
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || ""
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === "true"

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
  if (USE_MOCK_DATA) {
    // Return mock embeddings for testing
    return Array(1536)
      .fill(0)
      .map(() => Math.random() * 2 - 1)
  }

  try {
    // Dynamic import to avoid issues with server/client
    const { embed } = await import("ai")
    const { openai } = await import("@ai-sdk/openai")

    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: text,
    })

    return embedding
  } catch (error) {
    console.error("Error generating embeddings:", error)
    throw error
  }
}

// Get Pinecone stats
export async function getPineconeStats() {
  try {
    const index = getPineconeIndex()
    const stats = await index.describeIndexStats()

    return {
      vectorCount: stats.totalVectorCount,
      dimensions: stats.dimension || 0,
      indexName: PINECONE_INDEX_NAME,
    }
  } catch (error) {
    console.error("Error getting Pinecone stats:", error)
    return {
      vectorCount: 0,
      dimensions: 0,
      indexName: PINECONE_INDEX_NAME,
    }
  }
}

// Search for similar documents
export async function searchSimilarDocuments(query: string, filters?: Record<string, any>, limit = 5) {
  if (USE_MOCK_DATA) {
    // Return mock results for testing
    return Array(limit)
      .fill(0)
      .map((_, i) => ({
        id: `mock-id-${i}`,
        title: `Mock Document ${i + 1}`,
        content: `This is a mock document content for query: ${query}`,
        score: 0.9 - i * 0.1,
        metadata: {
          category: filters?.category || "General",
          version: filters?.version || "1.0",
        },
      }))
  }

  try {
    // Generate embeddings for the query
    const queryEmbedding = await generateEmbeddings(query)

    // Prepare filter if provided
    const pineconeFilter = filters
      ? {
          ...filters,
        }
      : undefined

    // Search Pinecone
    const index = getPineconeIndex()
    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true,
      filter: pineconeFilter,
    })

    // Format results
    return searchResults.matches.map((match) => ({
      id: match.id,
      title: (match.metadata?.title as string) || "Untitled Document",
      content: (match.metadata?.content as string) || "",
      score: match.score,
      metadata: match.metadata || {},
    }))
  } catch (error) {
    console.error("Error searching similar documents:", error)
    throw error
  }
}

// Generate answer from search results
export async function generateAnswerFromResults(query: string, results: any[]) {
  if (USE_MOCK_DATA) {
    return `This is a mock answer for query: ${query}. It references information from ${results.length} documents.`
  }

  try {
    // Prepare context from results
    const context = results
      .map((result, index) => `Document ${index + 1} (${result.title}): ${result.content}`)
      .join("\n\n")

    // Dynamic import to avoid issues with server/client
    const { generateText } = await import("ai")
    const { openai } = await import("@ai-sdk/openai")

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
  } catch (error) {
    console.error("Error generating answer:", error)
    throw error
  }
}

// Process a document for indexing
export async function processDocument(id: string, title: string, content: string, metadata: Record<string, any> = {}) {
  if (USE_MOCK_DATA) {
    console.log("Mock: Processing document", { id, title })
    return { success: true, chunksProcessed: 3 }
  }

  try {
    // Split content into chunks
    const chunkSize = 1000
    const overlap = 200
    const chunks = []

    for (let i = 0; i < content.length; i += chunkSize - overlap) {
      const chunk = content.substring(i, i + chunkSize)
      if (chunk.length < 50) continue // Skip very small chunks

      chunks.push({
        content: chunk,
        metadata: {
          ...metadata,
          chunkIndex: chunks.length,
        },
      })
    }

    // Insert document into Pinecone
    await insertDocumentIntoPinecone(id, title, content, metadata, chunks)

    return { success: true, chunksProcessed: chunks.length }
  } catch (error) {
    console.error("Error processing document:", error)
    throw error
  }
}

// Insert document into Pinecone
export async function insertDocumentIntoPinecone(
  id: string,
  title: string,
  content: string,
  metadata: Record<string, any>,
  chunks: { content: string; metadata: Record<string, any> }[],
) {
  if (USE_MOCK_DATA) {
    console.log("Mock: Inserting document into Pinecone", { id, title })
    return { success: true, chunksInserted: chunks.length }
  }

  try {
    const index = getPineconeIndex()

    // Process chunks and generate embeddings
    const vectors = await Promise.all(
      chunks.map(async (chunk, i) => {
        const embedding = await generateEmbeddings(chunk.content)
        return {
          id: `${id}_chunk_${i}`,
          values: embedding,
          metadata: {
            ...chunk.metadata,
            documentId: id,
            title,
            content: chunk.content,
            chunkIndex: i,
          },
        }
      }),
    )

    // Insert vectors in batches to avoid rate limits
    const batchSize = 100
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize)
      await index.upsert(batch)
    }

    return { success: true, chunksInserted: vectors.length }
  } catch (error) {
    console.error("Error inserting document into Pinecone:", error)
    throw error
  }
}

// Delete document from Pinecone
export async function deleteDocumentFromPinecone(id: string) {
  if (USE_MOCK_DATA) {
    console.log("Mock: Deleting document from Pinecone", { id })
    return { success: true }
  }

  try {
    const index = getPineconeIndex()

    // Delete by metadata filter
    await index.deleteMany({
      filter: {
        documentId: id,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting document from Pinecone:", error)
    throw error
  }
}

// Delete document vectors
export async function deleteDocumentVectors(documentId: string) {
  if (USE_MOCK_DATA) {
    console.log("Mock: Deleting document vectors", { documentId })
    return { success: true }
  }

  try {
    const index = getPineconeIndex()

    // Delete vectors by filter
    await index.deleteMany({
      filter: {
        documentId: documentId,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting document vectors:", error)
    throw error
  }
}
