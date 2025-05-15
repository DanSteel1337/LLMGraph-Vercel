"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import SearchResults from "./search-results"
import SearchFilters from "./search-filters"
import ErrorBoundary from "@/components/ui/error-boundary"

interface SearchResult {
  id: string
  title: string
  content: string
  score: number
}

export default function SearchInterface() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      console.error("Error performing search:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Search Documentation</CardTitle>
        <CardDescription>Find information in the Unreal Engine documentation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search for documentation..."
              className="pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-1">
            <ErrorBoundary>
              <SearchFilters />
            </ErrorBoundary>
          </div>
          <div className="md:col-span-3">
            <ErrorBoundary>
              {error ? (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                  <p>Error: {error}</p>
                </div>
              ) : (
                <SearchResults results={results} loading={loading} />
              )}
            </ErrorBoundary>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
