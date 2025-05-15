import { embed } from "ai"
import { openai } from "@ai-sdk/openai"

export const runtime = "nodejs"

export async function generateEmbedding(text: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not defined")
  }

  try {
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: text,
    })

    return embedding
  } catch (error) {
    console.error("Error generating embedding:", error)
    throw error
  }
}

export async function generateEmbeddings(texts: string[]) {
  return Promise.all(texts.map((text) => generateEmbedding(text)))
}
