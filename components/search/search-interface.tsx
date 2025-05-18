"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Info } from "lucide-react"
import SearchResults from "./search-results"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import { logError } from "@/lib/error-handler"

// Define the search result type
export interface SearchResult {
  id: string
  title: string
  content: string
  score: number
  metadata: {
    source?: string
    page?: number
    category?: string
    version?: string
    [key: string]: any
  }
}

// Component definition
function SearchInterface() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchType, setSearchType] = useState("hybrid")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!query.trim()) return

    // Set loading state before starting the search
    setLoading(true)
    setError(null)

    try {
      // Track the search for analytics (non-blocking)
      apiClient
        .post("/api/analytics/track-search", { query, searchType })
        .catch((err) => console.error("Error tracking search:", err))

      // Perform the search using the API client
      const response = await apiClient.get(`/api/search?q=${encodeURIComponent(query)}&type=${searchType}`)

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data = await response.json()

      // Update results state after search completes
      setResults(data.results || [])
    } catch (err) {
      // Log the error
      logError(err, "search_interface_error")

      // Update error state
      setError(err instanceof Error ? err.message : "An unknown error occurred")

      // Show toast notification
      toast({
        title: "Search Error",
        description: err instanceof Error ? err.message : "Failed to perform search",
        variant: "destructive",
      })

      // Clear results
      setResults([])
    } finally {
      // Always reset loading state
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const submitFeedback = async (resultId: string, isPositive: boolean) => {
    try {
      await apiClient.post("/api/feedback/submit", {
        query,
        resultId,
        isPositive,
        searchType,
      })

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
        variant: "default",
      })
    } catch (err) {
      logError(err, "feedback_submission_error")

      toast({
        title: "Feedback Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Search Documentation</CardTitle>
        <CardDescription>Find answers in the Unreal Engine documentation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="What are you looking for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
              disabled={loading}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
          </div>

          <Tabs defaultValue="hybrid" value={searchType} onValueChange={setSearchType} disabled={loading}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
              <TabsTrigger value="vector">Semantic</TabsTrigger>
              <TabsTrigger value="keyword">Keyword</TabsTrigger>
            </TabsList>
            <TabsContent value="hybrid">
              <p className="text-sm text-muted-foreground">
                Combines semantic understanding with keyword matching for the best results.
              </p>
            </TabsContent>
            <TabsContent value="vector">
              <p className="text-sm text-muted-foreground">
                Uses AI to understand the meaning behind your query, not just the words.
              </p>
            </TabsContent>
            <TabsContent value="keyword">
              <p className="text-sm text-muted-foreground">
                Traditional search that matches the exact words in your query.
              </p>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start">
              <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Search Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Results</h3>
                <Badge variant="outline">{results.length} found</Badge>
              </div>

              <SearchResults results={results} query={query} onFeedback={submitFeedback} />
            </div>
          )}

          {!loading && query && results.length === 0 && !error && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No results found for "{query}"</p>
              <p className="text-sm text-muted-foreground mt-2">Try using different keywords or search terms</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Searching...</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">Powered by Pinecone and OpenAI</p>
      </CardFooter>
    </Card>
  )
}

// Export both as default and named export to support both import styles
export default SearchInterface
export { SearchInterface }
