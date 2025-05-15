import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

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
    const { embedWithRetry } = await import("./embeddings")
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
