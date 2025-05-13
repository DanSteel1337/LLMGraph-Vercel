import { embed, generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { Pinecone } from "@pinecone-database/pinecone"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

// Add retry logic for OpenAI operations
export async function embedWithRetry(text: string, retries = 3, delay = 1000) {
  let lastError: any

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: text,
      })

      return embedding
    } catch (error) {
      console.error(`Embedding attempt ${attempt + 1} failed:`, error)
      lastError = error

      // Wait before retrying
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)))
      }
    }
  }

  throw new Error(`Failed to generate embedding after ${retries} attempts: ${lastError?.message || lastError}`)
}

// Create a fresh Pinecone client for each request (no singleton)
function getPineconeClient() {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is not defined")
  }

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  })

  if (!process.env.PINECONE_INDEX_NAME) {
    throw new Error("PINECONE_INDEX_NAME is not defined")
  }

  return pinecone.Index(process.env.PINECONE_INDEX_NAME)
}

// Process a document and store it in Pinecone
export async function processDocument(
  documentId: string,
  content: string,
  metadata: Record<string, any>,
): Promise<boolean> {
  try {
    console.log(`Processing document ${documentId} for Pinecone storage`)

    // Get a fresh Pinecone client
    const pineconeIndex = getPineconeClient()

    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })

    const textChunks = await textSplitter.splitText(content)
    console.log(`Split document into ${textChunks.length} chunks`)

    // Process each chunk
    const vectors = await Promise.all(
      textChunks.map(async (chunk, i) => {
        // Generate embedding for the chunk
        const embedding = await embedWithRetry(chunk)

        return {
          id: `${documentId}-chunk-${i}`,
          values: embedding,
          metadata: {
            ...metadata,
            documentId,
            chunkIndex: i,
            text: chunk,
          },
        }
      }),
    )

    // Upsert vectors to Pinecone
    await pineconeIndex.upsert(vectors)
    console.log(`Successfully stored ${vectors.length} vectors in Pinecone`)

    return true
  } catch (error) {
    console.error("Error processing document:", error)
    return false
  }
}

// Search for similar documents
export async function searchSimilarDocuments(query: string, filters?: Record<string, any>, topK = 5): Promise<any[]> {
  try {
    console.log(`Searching for documents similar to: "${query}"`)

    // Get a fresh Pinecone client
    const pineconeIndex = getPineconeClient()

    // Generate embedding for the query
    const embedding = await embedWithRetry(query)

    // Prepare filter if provided
    const filterObj = filters ? { metadata: filters } : undefined

    // Query Pinecone
    const results = await pineconeIndex.query({
      vector: embedding,
      topK,
      includeMetadata: true,
      filter: filterObj,
    })

    console.log(`Found ${results.matches?.length || 0} matches in Pinecone`)

    // Process and return results
    return (
      results.matches?.map((match) => ({
        id: match.id,
        score: match.score,
        title: match.metadata?.title || "Untitled Document",
        content: match.metadata?.text || "",
        category: match.metadata?.category || "Uncategorized",
        version: match.metadata?.version || "Unknown",
        documentId: match.metadata?.documentId || match.id,
        highlights: [highlightText(match.metadata?.text as string, query)],
      })) || []
    )
  } catch (error) {
    console.error("Error searching documents:", error)
    throw error
  }
}

// Generate answer from RAG results
export async function generateAnswerFromResults(query: string, results: any[]): Promise<string> {
  try {
    // Extract context from results
    const context = results.map((result) => result.content).join("\n\n")

    // Generate answer using AI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        Answer the following question based ONLY on the provided context. 
        If the context doesn't contain relevant information, say "I don't have enough information to answer that question."
        
        Question: ${query}
        
        Context:
        ${context}
      `,
    })

    return text
  } catch (error) {
    console.error("Error generating answer:", error)
    return "Sorry, I couldn't generate an answer at this time."
  }
}

// Helper function to highlight matching text
function highlightText(text: string, query: string): string {
  if (!text) return ""

  // Simple highlighting by wrapping query terms in <mark> tags
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 2)

  let result = text

  queryTerms.forEach((term) => {
    const regex = new RegExp(`(${term})`, "gi")
    result = result.replace(regex, "<mark>$1</mark>")
  })

  return result
}

// Function to delete document from vector store
export async function deleteDocumentVectors(documentId: string): Promise<boolean> {
  try {
    console.log(`Deleting vectors for document ${documentId}`)

    // Get a fresh Pinecone client
    const pineconeIndex = getPineconeClient()

    // Delete all vectors with matching documentId in metadata
    await pineconeIndex.deleteMany({
      filter: {
        documentId: { $eq: documentId },
      },
    })

    console.log(`Successfully deleted vectors for document ${documentId}`)
    return true
  } catch (error) {
    console.error("Error deleting document vectors:", error)
    return false
  }
}

// Get stats from Pinecone
export async function getPineconeStats(): Promise<{
  vectorCount: number
  dimensions: number
  indexName: string
}> {
  try {
    // Get a fresh Pinecone client
    const pineconeIndex = getPineconeClient()

    // Get index stats
    const indexStats = await pineconeIndex.describeIndexStats()

    return {
      vectorCount: indexStats.totalVectorCount,
      dimensions: indexStats.dimension,
      indexName: process.env.PINECONE_INDEX_NAME || "unknown",
    }
  } catch (error) {
    console.error("Error getting Pinecone stats:", error)
    return {
      vectorCount: 0,
      dimensions: 0,
      indexName: "error",
    }
  }
}

// Update the health check for OpenAI
export async function checkOpenAIHealth() {
  try {
    console.log("Starting OpenAI health check")

    // Check if API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OpenAI API key is not set")
      return {
        status: "unhealthy",
        message: "OpenAI API key is not configured",
      }
    }

    // Use a very short text for the health check
    await embedWithRetry("test", 2, 500)
    console.log("OpenAI health check successful")
    return { status: "healthy", message: "OpenAI connection is working" }
  } catch (error) {
    console.error("OpenAI health check failed:", error)

    // Provide more specific error messages based on error type
    let errorMessage = "Unknown error"

    if (error instanceof Error) {
      errorMessage = error.message

      // Check for common OpenAI API errors
      if (errorMessage.includes("API key")) {
        errorMessage = "Invalid API key or authentication issue"
      } else if (errorMessage.includes("rate limit")) {
        errorMessage = "Rate limit exceeded"
      } else if (errorMessage.includes("quota")) {
        errorMessage = "API quota exceeded"
      } else if (errorMessage.includes("timeout")) {
        errorMessage = "Request timed out"
      }
    }

    return {
      status: "unhealthy",
      message: `OpenAI connection failed: ${errorMessage}`,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
