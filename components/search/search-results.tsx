"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, FileText, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface SearchResultsProps {
  results: SearchResult[]
  isSearching: boolean
  searchPerformed: boolean
}

export function SearchResults({ results, isSearching, searchPerformed }: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState<"all" | "relevant" | "exact">("all")

  // Filter results based on the active tab
  const filteredResults = (() => {
    switch (activeTab) {
      case "relevant":
        return results.filter((result) => result.score >= 0.8)
      case "exact":
        return results.filter((result) => result.score >= 0.9)
      default:
        return results
    }
  })()

  if (isSearching) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">Searching documents...</p>
        </CardContent>
      </Card>
    )
  }

  if (searchPerformed && results.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="rounded-full bg-muted p-3 mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No results found</h3>
          <p className="text-center text-muted-foreground">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!searchPerformed) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="rounded-full bg-muted p-3 mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Search for documentation</h3>
          <p className="text-center text-muted-foreground">
            Enter a search term and apply filters to find relevant documentation.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Search Results</CardTitle>
            <Badge variant="outline">{results.length} results</Badge>
          </div>
          <CardDescription>Showing results based on relevance to your query</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Results</TabsTrigger>
              <TabsTrigger value="relevant">Highly Relevant</TabsTrigger>
              <TabsTrigger value="exact">Exact Matches</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-0">
              <ResultsList results={filteredResults} />
            </TabsContent>
            <TabsContent value="relevant" className="mt-0">
              <ResultsList results={filteredResults} />
            </TabsContent>
            <TabsContent value="exact" className="mt-0">
              <ResultsList results={filteredResults} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function ResultsList({ results }: { results: SearchResult[] }) {
  if (results.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No results match the current filter</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div key={result.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-medium">{result.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{result.category}</Badge>
                <Badge variant="outline">v{result.version}</Badge>
                <Badge variant="secondary">{Math.round(result.score * 100)}% match</Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/documents/${result.documentId}`}>
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">View document</span>
              </Link>
            </Button>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {result.highlights.map((highlight, index) => (
              <div key={index} className="bg-muted/50 p-2 rounded" dangerouslySetInnerHTML={{ __html: highlight }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
