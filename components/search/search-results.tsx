"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { feedbackApi } from "@/lib/api-client"

interface SearchResult {
  id: string
  title: string
  content: string
  score: number
  metadata: {
    source?: string
    page?: number
    category?: string
    version?: string
    created_at?: string
    [key: string]: any
  }
}

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  onFeedback: (resultId: string, isPositive: boolean) => void
}

export default function SearchResults({ results, query, onFeedback }: SearchResultsProps) {
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({})
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpandedResults((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleFeedback = async (id: string, isPositive: boolean) => {
    if (!feedbackGiven[id]) {
      try {
        await feedbackApi.create({
          resultId: id,
          query,
          isPositive,
        })

        onFeedback(id, isPositive)
        setFeedbackGiven((prev) => ({
          ...prev,
          [id]: true,
        }))
      } catch (error) {
        console.error("Error submitting feedback:", error)
      }
    }
  }

  // Function to highlight query terms in content
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const terms = query
      .trim()
      .split(/\s+/)
      .filter((term) => term.length > 2)
    if (terms.length === 0) return text

    // Create a regex pattern for all terms
    const pattern = new RegExp(`(${terms.join("|")})`, "gi")

    // Split by the pattern and wrap matches in highlight spans
    const parts = text.split(pattern)

    return parts.map((part, i) => {
      if (terms.some((term) => part.toLowerCase() === term.toLowerCase())) {
        return (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">
            {part}
          </mark>
        )
      }
      return part
    })
  }

  // Function to get a snippet of text around the query terms
  const getContentSnippet = (content: string, query: string, maxLength = 300) => {
    if (!query.trim() || content.length <= maxLength) return content

    const terms = query
      .trim()
      .split(/\s+/)
      .filter((term) => term.length > 2)
    if (terms.length === 0) return content.substring(0, maxLength) + "..."

    // Find the first occurrence of any term
    let lowestIndex = content.length
    for (const term of terms) {
      const index = content.toLowerCase().indexOf(term.toLowerCase())
      if (index !== -1 && index < lowestIndex) {
        lowestIndex = index
      }
    }

    // If no term was found, return the beginning
    if (lowestIndex === content.length) {
      return content.substring(0, maxLength) + "..."
    }

    // Calculate start and end positions for the snippet
    const snippetStart = Math.max(0, lowestIndex - 100)
    const snippetEnd = Math.min(content.length, snippetStart + maxLength)

    // Add ellipsis if needed
    const prefix = snippetStart > 0 ? "..." : ""
    const suffix = snippetEnd < content.length ? "..." : ""

    return prefix + content.substring(snippetStart, snippetEnd) + suffix
  }

  return (
    <div className="space-y-4">
      {Array.isArray(results) &&
        results.map((result) => (
          <Card key={result.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{result.title || "Untitled Document"}</CardTitle>
                <Badge variant="outline" className="ml-2">
                  {Math.round(result.score * 100)}%
                </Badge>
              </div>
              <CardDescription>
                {result.metadata.source && (
                  <span className="inline-flex items-center mr-3">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {result.metadata.source}
                    {result.metadata.page && ` (p.${result.metadata.page})`}
                  </span>
                )}
                {result.metadata.category && (
                  <Badge variant="secondary" className="mr-2">
                    {result.metadata.category}
                  </Badge>
                )}
                {result.metadata.version && <Badge variant="outline">v{result.metadata.version}</Badge>}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <Collapsible open={expandedResults[result.id] || false}>
                <div className="text-sm text-muted-foreground">
                  {!expandedResults[result.id] ? (
                    <p>{highlightText(getContentSnippet(result.content, query), query)}</p>
                  ) : (
                    <p>{highlightText(result.content, query)}</p>
                  )}
                </div>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full flex items-center justify-center"
                    onClick={() => toggleExpand(result.id)}
                  >
                    {expandedResults[result.id] ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Show More
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>{/* Additional content shown when expanded */}</CollapsibleContent>
              </Collapsible>
            </CardContent>
            <CardFooter className="pt-1 flex justify-between">
              <div className="text-xs text-muted-foreground">ID: {result.id.substring(0, 8)}...</div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFeedback(result.id, true)}
                  disabled={feedbackGiven[result.id]}
                  title="This was helpful"
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleFeedback(result.id, false)}
                  disabled={feedbackGiven[result.id]}
                  title="This was not helpful"
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
    </div>
  )
}
