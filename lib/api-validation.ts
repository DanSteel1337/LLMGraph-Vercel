/**
 * API Validation Utility
 *
 * This file provides utilities to validate API calls and ensure they're targeting
 * existing endpoints.
 */

// List of valid API endpoints
const VALID_API_ENDPOINTS = [
  "/api/documents",
  "/api/search",
  "/api/feedback",
  "/api/system",
  "/api/test-db-connection",
  "/api/analytics/category-distribution",
  "/api/settings",
  // Add more endpoints as they are created
]

/**
 * Validates if an API endpoint exists
 * @param endpoint The API endpoint to validate
 * @returns True if the endpoint exists, false otherwise
 */
export function validateApiEndpoint(endpoint: string): boolean {
  // Extract the base endpoint without query parameters
  const baseEndpoint = endpoint.split("?")[0]

  // Check if the endpoint is in the list of valid endpoints
  return VALID_API_ENDPOINTS.some(
    (validEndpoint) => baseEndpoint === validEndpoint || baseEndpoint.startsWith(`${validEndpoint}/`),
  )
}

/**
 * Safe fetch wrapper that validates endpoints before making requests
 * @param endpoint The API endpoint to fetch
 * @param options Fetch options
 * @returns Fetch response
 */
export async function safeFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  // Validate the endpoint
  if (!validateApiEndpoint(endpoint)) {
    console.error(`Attempting to fetch nonexistent API endpoint: ${endpoint}`)
    throw new Error(`API endpoint does not exist: ${endpoint}`)
  }

  // Make the fetch request
  const response = await fetch(endpoint, options)

  // Check if the response is OK
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API error (${response.status}): ${errorText}`)
  }

  return response
}

/**
 * Safe JSON fetch wrapper that validates endpoints and handles JSON parsing
 * @param endpoint The API endpoint to fetch
 * @param options Fetch options
 * @returns Parsed JSON response
 */
export async function safeJsonFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await safeFetch(endpoint, options)
  return (await response.json()) as T
}
