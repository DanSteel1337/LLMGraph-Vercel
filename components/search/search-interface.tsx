"\"use client"

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

// Export the SearchInterface component as default
export default function SearchInterface() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchType, setSearchType] = useState("hybrid")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      // Track the search for analytics
      fetch("/api/analytics/track-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, searchType }),
      }).catch(console.error) // Non-blocking

      // Perform the search
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${searchType}`)

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      console.error("Search error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Search Error",
        description: err instanceof Error ? err.message : "Failed to perform search",
        variant: "destructive",
      })
      setResults([])
    } finally {
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
      await fetch("/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          resultId,
          isPositive,
          searchType,
        }),
      })

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
        variant: "default",
      })
    } catch (err) {
      console.error("Feedback error:", err)
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
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
          </div>

          <Tabs defaultValue="hybrid" value={searchType} onValueChange={setSearchType}>
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
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">Powered by Pinecone and OpenAI</p>
      </CardFooter>
    </Card>
  )
}
