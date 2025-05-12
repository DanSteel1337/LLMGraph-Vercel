"use client"

// This utility syncs the mock auth token between localStorage and cookies
export function syncMockAuthToken() {
  if (typeof window === "undefined") {
    return // Only run on client
  }

  // Check if we have a mock token in localStorage
  const mockToken = localStorage.getItem("mock_auth_token")

  if (mockToken) {
    // Set a cookie with the mock token
    document.cookie = `mock_auth_token=${mockToken}; path=/; max-age=86400`
  }
}

// Auto-sync when this module is imported
if (typeof window !== "undefined") {
  syncMockAuthToken()
}
