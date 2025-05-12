import { PineconeClient } from "@pinecone-database/pinecone"

export async function initializePinecone() {
  try {
    const apiKey = process.env.PINECONE_API_KEY
    const environment = process.env.PINECONE_HOSTNAME?.split(".")[0]
    const indexName = process.env.PINECONE_INDEX_NAME

    if (!apiKey || !environment || !indexName) {
      console.error("Missing Pinecone configuration")
      return null
    }

    const client = new PineconeClient()
    await client.init({
      apiKey,
      environment,
    })

    // Check if index exists
    const indexes = await client.listIndexes()

    if (!indexes.includes(indexName)) {
      console.log(`Creating Pinecone index: ${indexName}`)

      // Create index with OpenAI embedding dimensions
      await client.createIndex({
        createRequest: {
          name: indexName,
          dimension: 1536, // OpenAI embedding dimension
          metric: "cosine",
        },
      })

      // Wait for index to be ready
      let isIndexReady = false
      while (!isIndexReady) {
        const indexDescription = await client.describeIndex({
          indexName,
        })

        if (indexDescription.status?.ready) {
          isIndexReady = true
          console.log(`Pinecone index ${indexName} is ready`)
        } else {
          console.log(`Waiting for Pinecone index ${indexName} to be ready...`)
          await new Promise((resolve) => setTimeout(resolve, 5000))
        }
      }
    }

    const index = client.Index(indexName)
    return index
  } catch (error) {
    console.error("Error initializing Pinecone:", error)
    return null
  }
}

export async function getPineconeStats() {
  try {
    const apiKey = process.env.PINECONE_API_KEY
    const environment = process.env.PINECONE_HOSTNAME?.split(".")[0]
    const indexName = process.env.PINECONE_INDEX_NAME

    if (!apiKey || !environment || !indexName) {
      console.error("Missing Pinecone configuration")
      return null
    }

    const client = new PineconeClient()
    await client.init({
      apiKey,
      environment,
    })

    const index = client.Index(indexName)
    const stats = await index.describeIndexStats()

    return {
      vectorCount: stats.totalVectorCount,
      dimensions: stats.dimension,
      namespaces: stats.namespaces,
    }
  } catch (error) {
    console.error("Error getting Pinecone stats:", error)
    return null
  }
}
