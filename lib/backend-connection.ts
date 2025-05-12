// Backend connection utility
// This file provides utilities for connecting to the backend

// Check if we have a valid backend URL
export const hasBackendUrl = () => {
  return (
    !!process.env.NEXT_PUBLIC_API_URL &&
    process.env.NEXT_PUBLIC_API_URL !== "http://localhost:8000" &&
    !process.env.NEXT_PUBLIC_API_URL.includes("undefined")
  )
}

// Check if we have Pinecone credentials
export const hasPineconeCredentials = () => {
  return (
    !!process.env.PINECONE_API_KEY &&
    !!process.env.PINECONE_HOSTNAME &&
    process.env.PINECONE_API_KEY !== "undefined" &&
    process.env.PINECONE_HOSTNAME !== "undefined"
  )
}

// Check if we have OpenAI credentials
export const hasOpenAICredentials = () => {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "undefined"
}

// Get connection status
export const getConnectionStatus = () => {
  const hasBackend = hasBackendUrl()
  const hasPinecone = hasPineconeCredentials()
  const hasOpenAI = hasOpenAICredentials()
  const useMockDataEnv = process.env.USE_MOCK_DATA === "true"

  return {
    hasBackend,
    hasPinecone,
    hasOpenAI,
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "Not configured",
    useMockData: !hasBackend || !hasPinecone || !hasOpenAI || useMockDataEnv,
    environment: process.env.NODE_ENV || "development",
  }
}

// Check if we should use mock data
export const shouldUseMockData = () => {
  // Always use mock data if explicitly configured to do so
  if (process.env.USE_MOCK_DATA === "true") {
    return true
  }

  // In development, check if we have all required credentials
  if (process.env.NODE_ENV === "development") {
    const status = getConnectionStatus()
    return !status.hasBackend || !status.hasPinecone || !status.hasOpenAI
  }

  // In production, check connection status
  const status = getConnectionStatus()
  return status.useMockData
}

// Test backend connectivity
export async function testBackendConnection() {
  if (!hasBackendUrl()) {
    return { connected: false, error: "Backend URL not configured" }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 }, // Revalidate every minute
    })

    if (response.ok) {
      const data = await response.json()
      return {
        connected: true,
        pineconeStatus: data.connections?.pinecone || "unknown",
        openaiStatus: data.connections?.openai || "unknown",
      }
    } else {
      return {
        connected: false,
        error: `Backend returned status ${response.status}`,
      }
    }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
