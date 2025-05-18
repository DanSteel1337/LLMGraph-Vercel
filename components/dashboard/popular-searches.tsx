"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchData } from "@/lib/api-client"
import { formatDate } from "@/lib/utils" // Assuming formatDate is a utility function

interface PopularSearchesProps {
  limit?: number
}

// Mock data for development and fallback
const MOCK_SEARCHES = [
  { id: 1, term: "blueprints", count: 120, last_searched: new Date() },
  { id: 2, term: "materials", count: 95, last_searched: new Date() },
  { id: 3, term: "animation", count: 87, last_searched: new Date() },
  { id: 4, term: "lighting", count: 76, last_searched: new Date() },
  { id: 5, term: "physics", count: 65, last_searched: new Date() },
]

export function PopularSearches({ limit = 5 }: PopularSearchesProps) {
  const [searches, setSearches] = useState<{ id: number; term: string; count: number; last_searched: Date }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMockData, setIsMockData] = useState(false)

  useEffect(() => {
    const fetchPopularSearches = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setIsMockData(false)

        // Check if we're on the login page
        const isLoginPage =
          typeof window !== "undefined" &&
          (window.location.pathname === "/login" || window.location.pathname === "/signup")

        // Use mock data if on login page or if env var is set
        if (isLoginPage || process.env.USE_MOCK_DATA === "true") {
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 500))
          setSearches(MOCK_SEARCHES.slice(0, limit))
          setIsMockData(true)
          return
        }

        // Use Supabase client directly instead of deprecated function
        const data = await fetchData<any[]>("/api/search?type=popular", {
          requiresAuth: true,
        })

        setSearches(data.slice(0, limit))
      } catch (error) {
        console.error("Error fetching popular searches:", error)
        setError("Failed to fetch popular searches")

        // Use mock data as fallback
        setSearches(MOCK_SEARCHES.slice(0, limit))
        setIsMockData(true)
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
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ))
      ) : error && !isMockData ? (
        <div className="text-center py-4 text-sm text-muted-foreground">{error}</div>
      ) : searches.length === 0 ? (
        <div className="text-center py-4 text-sm text-muted-foreground">No search data available</div>
      ) : (
        <div className="space-y-2">
          {isMockData && error && <div className="text-xs text-amber-600 mb-2">Showing mock data. Error: {error}</div>}
          <ul>
            {Array.isArray(searches) &&
              searches.map((search) => (
                <li key={search.id} className="flex justify-between items-center">
                  <span className="text-sm truncate max-w-[30%]">{search.term}</span>
                  <span className="text-sm font-medium bg-muted px-2 py-1 rounded-full">{search.count}</span>
                  <span className="text-sm font-medium bg-muted px-2 py-1 rounded-full">
                    {formatDate(search.last_searched, "N/A")}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}
