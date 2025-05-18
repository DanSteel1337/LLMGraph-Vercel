/**
 * Library Index Module
 *
 * Central export point for all utility functions, constants, and types.
 * This file re-exports all public APIs from the lib directory.
 *
 * @module lib/index
 */

// API Client
export { apiClient, ApiClient } from "./api-client"

// Environment utilities
export {
  shouldUseMockData,
  isProduction,
  isDevelopment,
  isPreview,
  getVercelEnv,
} from "./environment"

// Error handling
export { logError, handleApiError } from "./error-handler"

// Environment validation
export { validateEnvVar, validateRequiredEnvVars } from "./env-validator"

// Mock data
export {
  MOCK_STATS,
  MOCK_SYSTEM_STATUS,
  MOCK_SEARCH_TRENDS,
  MOCK_POPULAR_SEARCHES,
  MOCK_DOCUMENTS,
  MOCK_SEARCH_RESULTS,
  MOCK_FEEDBACK,
  MOCK_CATEGORY_DISTRIBUTION,
  ensureArray,
  ensureObject,
  getMockCategories,
  getMockVersions,
  getMockChunks,
  getMockEmbeddings,
  getMockGeneratedAnswer,
  getMockDocumentSummary,
  getMockSearchResults,
  getMockPineconeQueryResponse,
} from "./mock-data"

// Search utilities
export {
  performSearch,
  trackSearchQuery,
  searchSimilarDocuments,
} from "./search"

// Pinecone utilities
export {
  getPineconeClient,
  getPineconeIndex,
  checkPineconeConnection,
  getDetailedIndexStats,
  createClient as createPineconeClient,
} from "./pinecone/client"

// Supabase utilities
export { createClient as createSupabaseClient } from "./supabase/client"
export { createClient as createSupabaseServerClient, createServerClient } from "./supabase/server"

// General utilities
export { cn, formatDate, truncateText } from "./utils"
