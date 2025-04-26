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
  return !!process.env.PINECONE_API_KEY && !!process.env.PINECONE_HOSTNAME
}

// Get connection status
export const getConnectionStatus = () => {
  return {
    hasBackend: hasBackendUrl(),
    hasPinecone: hasPineconeCredentials(),
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "Not configured",
    useMockData: !hasBackendUrl() || process.env.USE_MOCK_DATA === "true",
  }
}

// Check if we should use mock data
export const shouldUseMockData = () => {
  // Always use mock data for now to prevent timeout issues
  return true
}
