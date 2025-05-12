import { Pinecone } from "@pinecone-database/pinecone"

export async function ensurePineconeIndex() {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_HOSTNAME!.split(".")[0],
    })

    const indexName = process.env.PINECONE_INDEX_NAME || "ue-docs"

    // Check if index exists
    const existingIndexes = await pinecone.listIndexes()

    if (!existingIndexes.some((idx) => idx.name === indexName)) {
      console.log(`Creating Pinecone index: ${indexName}`)

      // Create index with dimensions for text-embedding-3-large
      await pinecone.createIndex({
        name: indexName,
        dimension: 3072, // Updated for text-embedding-3-large
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-west-2",
          },
        },
      })

      console.log(`Created Pinecone index: ${indexName}`)
      return true
    } else {
      console.log(`Pinecone index ${indexName} already exists`)
      return true
    }
  } catch (error) {
    console.error("Error setting up Pinecone index:", error)
    return false
  }
}
