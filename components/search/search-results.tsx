import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ThumbsDown, ThumbsUp } from "lucide-react"
import type { SearchResult } from "./search-interface"

interface SearchResultsProps {
  results: SearchResult[]
  isSearching: boolean
  searchPerformed: boolean
}

export function SearchResults({ results, isSearching, searchPerformed }: SearchResultsProps) {
  if (isSearching) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>Searching...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[70%]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!searchPerformed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>Enter a search query to find relevant documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">No search performed yet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>No results found for your query</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Try adjusting your search terms or filters</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Results</CardTitle>
        <CardDescription>Found {results.length} results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {results.map((result) => (
            <div key={result.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{result.title}</h3>
                <Badge variant="outline">Score: {result.score.toFixed(2)}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{result.category}</Badge>
                <Badge variant="outline">{result.version}</Badge>
              </div>
              <div className="rounded-md bg-muted p-3 text-sm">
                {result.highlights.map((highlight, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: highlight }} />
                ))}
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="mr-1 h-4 w-4" />
                  Helpful
                </Button>
                <Button variant="ghost" size="sm">
                  <ThumbsDown className="mr-1 h-4 w-4" />
                  Not Helpful
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
