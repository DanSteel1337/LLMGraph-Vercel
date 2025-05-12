import { OpenAIEmbeddings } from "@langchain/openai"
import { Pinecone } from "@pinecone-database/pinecone"

export async function testEmbeddings(text: string) {
  try {
    // Initialize OpenAI embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-3-large",
      dimensions: 3072,
    })

    // Generate embeddings for the text
    const embedding = await embeddings.embedQuery(text)

    // Initialize Pinecone client with correct parameters
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
      // Extract the controller host URL from the hostname
      controllerHostUrl: `https://controller.${process.env.PINECONE_HOSTNAME!.split(".")[0]}.pinecone.io`,
    })

    // Get Pinecone index
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME || "ue-docs")

    // Test connection to Pinecone
    const stats = await pineconeIndex.describeIndexStats()

    return {
      success: true,
      embedding: embedding.slice(0, 10), // Return just the first 10 values for brevity
      dimensions: embedding.length,
      pineconeStats: stats,
    }
  } catch (error) {
    console.error("Error testing embeddings:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
