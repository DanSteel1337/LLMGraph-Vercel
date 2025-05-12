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

// Get connection status
export const getConnectionStatus = () => {
  const hasBackend = hasBackendUrl()
  const hasPinecone = hasPineconeCredentials()
  const useMockDataEnv = process.env.USE_MOCK_DATA === "true"

  return {
    hasBackend,
    hasPinecone,
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "Not configured",
    useMockData: !hasBackend || useMockDataEnv,
    environment: process.env.NODE_ENV || "development",
  }
}

// Check if we should use mock data
export const shouldUseMockData = () => {
  // Always use mock data in development or preview environments
  // unless specifically configured not to
  if (process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview") {
    // Only use real data if explicitly configured and backend URL is valid
    if (process.env.USE_MOCK_DATA === "false" && hasBackendUrl()) {
      return false
    }
    return true
  }

  // In production, check connection status
  const status = getConnectionStatus()
  return status.useMockData
}

// Test backend connectivity
export const testBackendConnection = async () => {
  if (!hasBackendUrl()) {
    return { connected: false, error: "Backend URL not configured" }
  }

  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (response.ok) {
      return { connected: true }
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
