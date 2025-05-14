"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getPopularSearches } from "@/lib/db"

interface PopularSearch {
  query: string
  count: number
}

export function PopularSearches() {
  const [searches, setSearches] = useState<PopularSearch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPopularSearches = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getPopularSearches()
        setSearches(data)
      } catch (error) {
        console.error("Error fetching popular searches:", error)
        setError("Failed to fetch popular searches")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPopularSearches()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Searches</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-4 w-[50px]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4 text-sm text-muted-foreground">{error}</div>
        ) : searches.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">No search data available</div>
        ) : (
          <div className="space-y-2">
            {searches.map((search, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm truncate max-w-[200px]">{search.query}</span>
                </div>
                <Badge variant="secondary">{search.count}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
