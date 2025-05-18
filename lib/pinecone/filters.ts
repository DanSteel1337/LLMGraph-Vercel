export type PineconeFilter = Record<string, any>

/**
 * Creates a filter for matching documents by category
 * @param categories Array of categories to match
 * @returns Pinecone filter object
 */
export function createCategoryFilter(categories: string[]): PineconeFilter {
  if (categories.length === 0) return {}
  if (categories.length === 1) {
    return { category: { $eq: categories[0] } }
  }
  return { category: { $in: categories } }
}

/**
 * Creates a filter for matching documents by date range
 * @param startDate Start date in ISO format
 * @param endDate End date in ISO format
 * @returns Pinecone filter object
 */
export function createDateRangeFilter(startDate?: string, endDate?: string): PineconeFilter {
  if (!startDate && !endDate) return {}

  const dateFilter: Record<string, any> = {}

  if (startDate) {
    dateFilter["$gte"] = startDate
  }

  if (endDate) {
    dateFilter["$lte"] = endDate
  }

  return { createdAt: dateFilter }
}

/**
 * Creates a filter for matching documents by version
 * @param version Version string or array of versions
 * @returns Pinecone filter object
 */
export function createVersionFilter(version: string | string[]): PineconeFilter {
  if (!version) return {}

  if (typeof version === "string") {
    return { version: { $eq: version } }
  }

  if (Array.isArray(version) && version.length > 0) {
    return { version: { $in: version } }
  }

  return {}
}

/**
 * Creates a filter for matching documents by document ID
 * @param documentId Document ID
 * @returns Pinecone filter object
 */
export function createDocumentIdFilter(documentId: string): PineconeFilter {
  if (!documentId) return {}
  return { documentId: { $eq: documentId } }
}

/**
 * Creates a filter for matching documents by text content
 * @param text Text to search for
 * @returns Pinecone filter object
 */
export function createTextFilter(text: string): PineconeFilter {
  if (!text) return {}
  return { $text: { $search: text } }
}

/**
 * Combines multiple filters with AND logic
 * @param filters Array of filters to combine
 * @returns Combined Pinecone filter object
 */
export function combineFilters(filters: PineconeFilter[]): PineconeFilter {
  const nonEmptyFilters = filters.filter((f) => Object.keys(f).length > 0)
  if (nonEmptyFilters.length === 0) return {}
  if (nonEmptyFilters.length === 1) return nonEmptyFilters[0]

  return { $and: nonEmptyFilters }
}

/**
 * Combines multiple filters with OR logic
 * @param filters Array of filters to combine
 * @returns Combined Pinecone filter object
 */
export function combineFiltersOr(filters: PineconeFilter[]): PineconeFilter {
  const nonEmptyFilters = filters.filter((f) => Object.keys(f).length > 0)
  if (nonEmptyFilters.length === 0) return {}
  if (nonEmptyFilters.length === 1) return nonEmptyFilters[0]

  return { $or: nonEmptyFilters }
}

/**
 * Creates a negated filter (NOT)
 * @param filter Filter to negate
 * @returns Negated Pinecone filter object
 */
export function negateFilter(filter: PineconeFilter): PineconeFilter {
  if (Object.keys(filter).length === 0) return {}
  return { $not: filter }
}

/**
 * Creates a complex filter from search parameters
 * @param params Search parameters object
 * @returns Pinecone filter object
 */
export function createSearchFilter(params: {
  categories?: string[]
  startDate?: string
  endDate?: string
  version?: string | string[]
  documentId?: string
  text?: string
}): PineconeFilter {
  const filters: PineconeFilter[] = []

  if (params.categories && params.categories.length > 0) {
    filters.push(createCategoryFilter(params.categories))
  }

  if (params.startDate || params.endDate) {
    filters.push(createDateRangeFilter(params.startDate, params.endDate))
  }

  if (params.version) {
    filters.push(createVersionFilter(params.version))
  }

  if (params.documentId) {
    filters.push(createDocumentIdFilter(params.documentId))
  }

  if (params.text) {
    filters.push(createTextFilter(params.text))
  }

  return combineFilters(filters)
}

/**
 * Builds Pinecone filters from a filter object
 * @param filters Filter object
 * @returns Pinecone filter object
 */
export function buildPineconeFilters(filters: Record<string, any>): PineconeFilter {
  if (!filters || Object.keys(filters).length === 0) {
    return {}
  }

  const pineconeFilters: PineconeFilter[] = []

  // Process category filters
  if (filters.categories && Array.isArray(filters.categories) && filters.categories.length > 0) {
    pineconeFilters.push(createCategoryFilter(filters.categories))
  }

  // Process date range filters
  if (filters.startDate || filters.endDate) {
    pineconeFilters.push(createDateRangeFilter(filters.startDate, filters.endDate))
  }

  // Process version filters
  if (filters.version) {
    pineconeFilters.push(createVersionFilter(filters.version))
  }

  // Process document ID filter
  if (filters.documentId) {
    pineconeFilters.push(createDocumentIdFilter(filters.documentId))
  }

  // Process text filter
  if (filters.text) {
    pineconeFilters.push(createTextFilter(filters.text))
  }

  // Combine all filters with AND logic
  return combineFilters(pineconeFilters)
}
