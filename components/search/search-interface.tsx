"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchResults } from "./search-results"
import { SearchFilters } from "./search-filters"
import { performSearch } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export interface SearchResult {
  id: string
  title: string
  content: string
  category: string
  version: string
  score: number
  highlights: string[]
  documentId: string
}

export function SearchInterface() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [answer, setAnswer] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchMode, setSearchMode] = useState<"semantic" | "keyword" | "hybrid">("semantic")
  const [filters, setFilters] = useState({
    categories: [] as string[],
    versions: [] as string[],
  })
  const [hasSearched, setHasSearched] = useState(false)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search term to continue",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    setAnswer(null)

    try {
      const searchParams = {
        query,
        mode: searchMode,
        filters,
        generateAnswer: true,
      }

      const searchResponse = await performSearch(searchParams)

      setResults(searchResponse.results || [])
      setAnswer(searchResponse.answer || null)

      if (searchResponse.results?.length === 0) {
        toast({
          title: "No results found",
          description: "Try adjusting your search terms or filters",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Search failed:", error)
      toast({
        title: "Search failed",
        description: "There was an error processing your search. Please try again.",
        variant: "destructive",
      })
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Search Unreal Engine Documentation</CardTitle>
          <CardDescription>Search through the vector database for relevant documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for documentation..."
                  className="pl-8"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>

            <Tabs defaultValue="semantic" onValueChange={(value) => setSearchMode(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="semantic">Semantic</TabsTrigger>
                <TabsTrigger value="keyword">Keyword</TabsTrigger>
                <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
              </TabsList>
              <TabsContent value="semantic">
                <p className="text-sm text-muted-foreground">
                  Semantic search uses AI embeddings to find conceptually similar content, even if the exact keywords
                  don't match.
                </p>
              </TabsContent>
              <TabsContent value="keyword">
                <p className="text-sm text-muted-foreground">
                  Keyword search looks for exact matches of your search terms in the documentation.
                </p>
              </TabsContent>
              <TabsContent value="hybrid">
                <p className="text-sm text-muted-foreground">
                  Hybrid search combines both semantic and keyword approaches for more comprehensive results.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1">
          <SearchFilters filters={filters} onChange={setFilters} onApply={handleSearch} />
        </div>
        <div className="md:col-span-3">
          {answer && !isSearching && results.length > 0 && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>AI Answer</CardTitle>
                <CardDescription>Generated from the search results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {answer.split("\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          <SearchResults results={results} isSearching={isSearching} searchPerformed={hasSearched} />
        </div>
      </div>
    </div>
  )
}
