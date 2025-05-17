"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { createSafeClient } from "@/lib/supabase/client"

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

        // Use mock data if environment variable is set
        if (process.env.USE_MOCK_DATA === "true") {
          const mockData = [
            { query: "blueprints", count: 120 },
            { query: "materials", count: 95 },
            { query: "animation", count: 87 },
            { query: "lighting", count: 76 },
            { query: "physics", count: 65 },
          ]
          setSearches(mockData.slice(0, limit))
          return
        }

        // Use Supabase client directly instead of deprecated function
        const supabase = createSafeClient()
        if (!supabase) {
          throw new Error("Supabase client not available")
        }

        // Get the most popular searches
        const { data, error } = await supabase
          .from("search_history")
          .select("query")
          .order("created_at", { ascending: false })
          .limit(100) // Get more than we need for processing

        if (error) {
          throw error
        }

        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid data format received from Supabase")
        }

        // Count occurrences of each query
        const queryCounts: Record<string, number> = {}
        data.forEach((item) => {
          const query = item.query.toLowerCase().trim()
          queryCounts[query] = (queryCounts[query] || 0) + 1
        })

        // Convert to array and sort by count
        const popularSearches = Object.entries(queryCounts)
          .map(([query, count]) => ({ query, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit)

        setSearches(popularSearches)
      } catch (error) {
        console.error("Error fetching popular searches:", error)
        setError("Failed to fetch popular searches")
        setSearches([])
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
