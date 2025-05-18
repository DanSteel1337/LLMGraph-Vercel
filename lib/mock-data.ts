/**
 * Mock data for development and testing
 *
 * This file contains mock data that can be used when:
 * 1. Running in development mode
 * 2. When USE_MOCK_DATA environment variable is set to "true"
 * 3. As fallbacks when API calls fail
 */

// Mock stats data
export const MOCK_STATS = {
  totalDocuments: 125,
  totalSearches: 1842,
  totalFeedback: 37,
  vectorCount: 3750,
  dimensions: 1536,
  indexName: "unreal-docs",
}

// Mock search trends data
export const MOCK_SEARCH_TRENDS = [
  { date: "2023-05-01", searches: 45, successRate: 82 },
  { date: "2023-05-02", searches: 52, successRate: 78 },
  { date: "2023-05-03", searches: 61, successRate: 85 },
  { date: "2023-05-04", searches: 48, successRate: 79 },
  { date: "2023-05-05", searches: 64, successRate: 88 },
  { date: "2023-05-06", searches: 57, successRate: 84 },
  { date: "2023-05-07", searches: 68, successRate: 91 },
]

// Mock popular searches
export const MOCK_POPULAR_SEARCHES = [
  { query: "blueprints", count: 120 },
  { query: "materials", count: 95 },
  { query: "animation", count: 87 },
  { query: "lighting", count: 76 },
  { query: "physics", count: 65 },
]

// Mock documents
export const MOCK_DOCUMENTS = [
  {
    id: "doc-1",
    title: "Getting Started with Unreal Engine",
    description: "A beginner's guide to Unreal Engine development",
    category: "Tutorials",
    version: "5.1",
    createdAt: "2023-04-15T10:30:00Z",
    updatedAt: "2023-04-15T10:30:00Z",
    status: "published",
    pageCount: 12,
  },
  {
    id: "doc-2",
    title: "Blueprint Visual Scripting",
    description: "Learn how to create gameplay mechanics without coding",
    category: "Programming",
    version: "5.1",
    createdAt: "2023-04-10T14:20:00Z",
    updatedAt: "2023-04-12T09:15:00Z",
    status: "published",
    pageCount: 28,
  },
  {
    id: "doc-3",
    title: "Material System Overview",
    description: "Understanding Unreal Engine's material system",
    category: "Graphics",
    version: "5.0",
    createdAt: "2023-03-22T11:45:00Z",
    updatedAt: "2023-03-25T16:30:00Z",
    status: "published",
    pageCount: 18,
  },
]

// Mock search results
export const MOCK_SEARCH_RESULTS = [
  {
    id: "chunk-1",
    title: "Blueprint Visual Scripting",
    content:
      "Blueprints Visual Scripting is a complete gameplay scripting system based on the concept of using a node-based interface to create gameplay elements from within Unreal Editor. As with many common scripting languages, it is used to define object-oriented (OO) classes or objects in the engine.",
    score: 0.92,
    metadata: {
      source: "Blueprint Documentation",
      page: 1,
      category: "Programming",
      version: "5.1",
    },
  },
  {
    id: "chunk-2",
    title: "Blueprint Classes",
    content:
      "Blueprint Classes are ideal for making interactive assets such as doors, switches, collectible items, and destructible scenery. In the image below, you can see how a Blueprint can be used to create a door asset that automatically opens when a player approaches it.",
    score: 0.85,
    metadata: {
      source: "Blueprint Documentation",
      page: 3,
      category: "Programming",
      version: "5.1",
    },
  },
  {
    id: "chunk-3",
    title: "Blueprint Interface",
    content:
      "The Blueprint interface allows designers and gameplay programmers to leverage the power of Unreal Engine's C++ implementation in a visual, node-based environment. This system is extremely flexible and powerful as it provides the ability for designers to use virtually the full range of concepts and tools generally only available to programmers.",
    score: 0.78,
    metadata: {
      source: "Blueprint Documentation",
      page: 2,
      category: "Programming",
      version: "5.1",
    },
  },
]

// Mock feedback data
export const MOCK_FEEDBACK = [
  {
    id: "feedback-1",
    query: "how to create blueprints",
    resultId: "chunk-1",
    isPositive: true,
    timestamp: "2023-05-01T14:30:00Z",
    userId: "user-1",
  },
  {
    id: "feedback-2",
    query: "material system",
    resultId: "chunk-3",
    isPositive: false,
    timestamp: "2023-05-02T09:15:00Z",
    userId: "user-2",
  },
  {
    id: "feedback-3",
    query: "blueprint interface",
    resultId: "chunk-2",
    isPositive: true,
    timestamp: "2023-05-03T16:45:00Z",
    userId: "user-3",
  },
]

// Mock category distribution
export const MOCK_CATEGORY_DISTRIBUTION = [
  { category: "Programming", count: 45 },
  { category: "Graphics", count: 32 },
  { category: "Tutorials", count: 28 },
  { category: "Animation", count: 19 },
  { category: "Audio", count: 12 },
  { category: "Physics", count: 9 },
  { category: "Networking", count: 7 },
]

// Helper function to determine if mock data should be used
export function shouldUseMockData(): boolean {
  // Use mock data in development or when explicitly enabled
  return process.env.NODE_ENV === "development" || process.env.USE_MOCK_DATA === "true"
}
