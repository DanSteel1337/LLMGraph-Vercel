"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, SearchIcon } from "lucide-react"
import { hybridSearch, trackSearchQuery } from "@/lib/ai/hybrid-search"
import SearchResults from "@/components/search/search-results"
import SearchFilters from "@/components/search/search-filters"

export default function SearchInterface() {
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [answer, setAnswer] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Record<string, any>>({})

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) return

    try {
      setIsSearching(true)
      setError(null)

      // Record start time for performance tracking
      const startTime = performance.now()

      // Perform hybrid search
      const results = await hybridSearch(query, filters)

      // Calculate query time
      const queryTime = performance.now() - startTime

      // Track search for analytics
      await trackSearchQuery(query, results.length, undefined, Math.round(queryTime))

      setSearchResults(results)

      // If we have results, generate an answer
      if (results.length > 0) {
        try {
          const answerResponse = await fetch("/api/generate-answer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query,
              context: results
                .slice(0, 3)
                .map((r) => r.content)
                .join("\n\n"),
            }),
          })

          if (answerResponse.ok) {
            const answerData = await answerResponse.json()
            setAnswer(answerData.answer)
          } else {
            console.error("Failed to generate answer")
            setAnswer(null)
          }
        } catch (answerError) {
          console.error("Error generating answer:", answerError)
          setAnswer(null)
        }
      } else {
        setAnswer(null)
      }
    } catch (error) {
      console.error("Search error:", error)
      setError("An error occurred while searching. Please try again.")
      setSearchResults([])
      setAnswer(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
  }

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Search Documentation</CardTitle>
          <CardDescription>Search through Unreal Engine documentation using natural language</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Ask a question about Unreal Engine..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching || !query.trim()}>
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching
                </>
              ) : (
                <>
                  <SearchIcon className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <SearchFilters onFilterChange={handleFilterChange} />
        </div>

        <div className="md:col-span-3">
          {error && (
            <div className="bg-destructive/10 p-4 rounded-md text-destructive mb-4">
              <p>{error}</p>
            </div>
          )}

          {isSearching ? (
            <Card>
              <CardContent className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Searching documentation...</span>
              </CardContent>
            </Card>
          ) : searchResults.length > 0 ? (
            <SearchResults results={searchResults} answer={answer} query={query} />
          ) : query && !isSearching ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No results found. Try a different search term.</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
