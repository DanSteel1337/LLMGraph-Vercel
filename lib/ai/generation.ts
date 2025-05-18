import { shouldUseMockData } from "@/lib/environment"
import { getMockGeneratedAnswer, getMockDocumentSummary } from "@/lib/mock-data"

/**
 * Generate answer from search results
 * @param query User query
 * @param results Search results
 * @returns Generated answer
 */
export async function generateAnswerFromResults(query: string, results: any[]) {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      console.log("[MOCK] Using mock generated answer")
      return getMockGeneratedAnswer(query, results)
    }

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

/**
 * Generate summary for a document
 * @param title Document title
 * @param content Document content
 * @returns Generated summary
 */
export async function generateDocumentSummary(title: string, content: string) {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      console.log("[MOCK] Using mock document summary")
      return getMockDocumentSummary(title)
    }

    // Truncate content if too long
    const truncatedContent = content.length > 8000 ? content.substring(0, 8000) + "..." : content

    // Dynamic import to avoid issues with server/client
    const { generateText } = await import("ai")
    const { openai } = await import("@ai-sdk/openai")

    // Generate summary using OpenAI
    const prompt = `
      You are an assistant for Unreal Engine documentation. Generate a concise summary (max 3 sentences) for the following document.
      
      Title: ${title}
      
      Content:
      ${truncatedContent}
      
      Summary:
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
      maxTokens: 200,
    })

    return text
  } catch (error) {
    console.error("Error generating document summary:", error)
    throw error
  }
}
