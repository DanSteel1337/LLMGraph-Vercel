import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SearchResult {
  id: string
  title: string
  content: string
  score: number
}

interface SearchResultsProps {
  results: SearchResult[]
  loading: boolean
}

export default function SearchResults({ results, loading }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 w-2/3 rounded bg-gray-200"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-5/6 rounded bg-gray-200"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No results found. Try a different search term.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <Card key={result.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{result.title}</CardTitle>
            <CardDescription className="text-xs">Relevance: {Math.round(result.score * 100)}%</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              {result.content.length > 200 ? `${result.content.substring(0, 200)}...` : result.content}
            </p>
            <div className="mt-2">
              <a href={`/documents/${result.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                View Document
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
