import { OpenAIEmbeddings } from "@langchain/openai"

export async function testEmbeddings() {
  try {
    console.log("Testing text-embedding-3-large model...")

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-3-large",
      dimensions: 3072,
    })

    const testText = "Testing the text-embedding-3-large model for Unreal Engine documentation."

    const result = await embeddings.embedQuery(testText)

    console.log(`Successfully generated embedding with ${result.length} dimensions`)

    return {
      success: true,
      dimensions: result.length,
      sample: result.slice(0, 5), // First 5 values as sample
    }
  } catch (error) {
    console.error("Error testing embeddings:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
