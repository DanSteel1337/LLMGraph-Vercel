"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchPopularSearches } from "@/lib/api"

interface SearchQuery {
  query: string
  count: number
  successRate: number
}

export function PopularSearches() {
  const [searches, setSearches] = useState<SearchQuery[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getPopularSearches = async () => {
      try {
        const data = await fetchPopularSearches()
        setSearches(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch popular searches:", error)
        setSearches([])
        setIsLoading(false)
      }
    }

    getPopularSearches()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[50px]" />
          </div>
        ))}
      </div>
    )
  }

  if (searches.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No search data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {searches.map((search, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">{index + 1}</div>
            <span className="text-sm font-medium">{search.query}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">{search.count} searches</div>
            <div
              className={`text-xs ${search.successRate >= 70 ? "text-green-500" : search.successRate >= 40 ? "text-yellow-500" : "text-red-500"}`}
            >
              {search.successRate}% success
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
