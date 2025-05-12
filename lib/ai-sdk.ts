import { OpenAIEmbeddings } from "@langchain/openai"
import { PineconeStore } from "@langchain/pinecone"
import { Pinecone } from "@pinecone-database/pinecone"
import { Document } from "langchain/document"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
  environment: process.env.PINECONE_HOSTNAME!.split(".")[0],
})

// Initialize OpenAI embeddings with text-embedding-3-large model
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-large", // Updated to use text-embedding-3-large
  dimensions: 3072, // text-embedding-3-large uses 3072 dimensions
})

// Get Pinecone index
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME || "ue-docs")

// Initialize vector store
export const vectorStore = new PineconeStore(embeddings, {
  pineconeIndex,
  namespace: "ue-documentation",
})

// Function to process and store documents
export async function processDocument(
  documentId: string,
  content: string,
  metadata: Record<string, any>,
): Promise<boolean> {
  try {
    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })

    const textChunks = await textSplitter.splitText(content)

    // Create documents with metadata
    const documents = textChunks.map((text, i) => {
      return new Document({
        pageContent: text,
        metadata: {
          ...metadata,
          documentId,
          chunkId: `${documentId}-chunk-${i}`,
          chunkIndex: i,
        },
      })
    })

    // Store documents in Pinecone
    await vectorStore.addDocuments(documents)

    return true
  } catch (error) {
    console.error("Error processing document:", error)
    return false
  }
}

// Function to search for similar documents
export async function searchSimilarDocuments(query: string, filters?: Record<string, any>, topK = 5) {
  try {
    const results = await vectorStore.similaritySearch(query, topK, filters)
    return results
  } catch (error) {
    console.error("Error searching documents:", error)
    return []
  }
}

// Function to delete document from vector store
export async function deleteDocumentVectors(documentId: string): Promise<boolean> {
  try {
    await pineconeIndex.deleteOne({
      filter: { documentId },
    })
    return true
  } catch (error) {
    console.error("Error deleting document vectors:", error)
    return false
  }
}
