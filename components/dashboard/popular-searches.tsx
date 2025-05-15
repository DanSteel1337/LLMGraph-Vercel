"use client"

import { useEffect, useState } from "react"
import { getPopularSearches } from "@/lib/db"
import { Skeleton } from "@/components/ui/skeleton"

interface PopularSearchesProps {
  limit?: number
}

export function PopularSearches({ limit = 5 }: PopularSearchesProps) {
  const [searches, setSearches] = useState<{ query: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPopularSearches = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getPopularSearches()
        setSearches(data.slice(0, limit))
      } catch (error) {
        console.error("Error fetching popular searches:", error)
        setError("Failed to fetch popular searches")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPopularSearches()
  }, [limit])

  return (
    <div className="space-y-4">
      {isLoading ? (
        Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <Skeleton className="h-4 w-[180px]" />
            <Skeleton className="h-4 w-[50px]" />
          </div>
        ))
      ) : error ? (
        <div className="text-center py-4 text-sm text-muted-foreground">{error}</div>
      ) : searches.length === 0 ? (
        <div className="text-center py-4 text-sm text-muted-foreground">No search data available</div>
      ) : (
        <div className="space-y-2">
          {searches.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm truncate max-w-[70%]">{item.query}</span>
              <span className="text-sm font-medium bg-muted px-2 py-1 rounded-full">{item.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
