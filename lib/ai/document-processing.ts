import { embedWithRetry } from "./embeddings"
import { upsertVectors, deleteVectorsByFilter } from "../pinecone/client"

// Process a document and store it in Pinecone
export async function processDocument(
  documentId: string,
  content: string,
  metadata: Record<string, any>,
): Promise<boolean> {
  try {
    console.log(`Processing document ${documentId} for Pinecone storage`)

    // Split text into chunks (simplified for edge compatibility)
    const chunkSize = 1000
    const overlap = 200
    const textChunks = []

    for (let i = 0; i < content.length; i += chunkSize - overlap) {
      const chunk = content.substring(i, i + chunkSize)
      if (chunk.length > 0) {
        textChunks.push(chunk)
      }
    }

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
    await upsertVectors(vectors)
    console.log(`Successfully stored ${vectors.length} vectors in Pinecone`)

    return true
  } catch (error) {
    console.error("Error processing document:", error)
    return false
  }
}

// Function to delete document from vector store
export async function deleteDocumentVectors(documentId: string): Promise<boolean> {
  try {
    console.log(`Deleting vectors for document ${documentId}`)

    // Delete all vectors with matching documentId in metadata
    await deleteVectorsByFilter({
      documentId: { $eq: documentId },
    })

    console.log(`Successfully deleted vectors for document ${documentId}`)
    return true
  } catch (error) {
    console.error("Error deleting document vectors:", error)
    return false
  }
}
