"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Search, ArrowRight } from "lucide-react"
import { fetchPopularSearches } from "@/lib/api"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SearchQuery {
  query: string
  count: number
  successRate: number
}

// Fallback data to use when the API request fails
const FALLBACK_DATA: SearchQuery[] = [
  {
    query: "blueprint interface",
    count: 87,
    successRate: 92,
  },
  {
    query: "animation retargeting",
    count: 64,
    successRate: 88,
  },
  {
    query: "physics constraints",
    count: 52,
    successRate: 76,
  },
  {
    query: "material parameters",
    count: 49,
    successRate: 94,
  },
  {
    query: "skeletal mesh",
    count: 43,
    successRate: 82,
  },
]

export function PopularSearches() {
  const [searches, setSearches] = useState<SearchQuery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getPopularSearches = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Set a timeout to prevent long-running requests
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        try {
          const data = await fetchPopularSearches()
          clearTimeout(timeoutId)

          // Validate the data structure
          if (!Array.isArray(data)) {
            console.warn("Invalid data format for popular searches, using fallback data")
            setSearches(FALLBACK_DATA)
            setError("Using fallback data (invalid format)")
          } else {
            setSearches(data)
          }
        } catch (fetchError) {
          console.error("Failed to fetch popular searches:", fetchError)
          setSearches(FALLBACK_DATA)

          if (fetchError instanceof Error) {
            if (fetchError.name === "AbortError") {
              setError("Request timeout - using fallback data")
            } else {
              setError(`${fetchError.message} - using fallback data`)
            }
          } else {
            setError("Failed to load data - using fallback data")
          }
        }
      } catch (error) {
        console.error("Error in popular searches component:", error)
        setSearches(FALLBACK_DATA)
        setError("An unexpected error occurred - using fallback data")
      } finally {
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

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="warning" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        {searches.map((search, index) => (
          <Link
            key={index}
            href={`/search?q=${encodeURIComponent(search.query)}`}
            className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                {index + 1}
              </div>
              <span className="text-sm font-medium">{search.query}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">{search.count}</div>
              <div
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  search.successRate >= 70
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : search.successRate >= 40
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {search.successRate}%
              </div>
            </div>
          </Link>
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
    <div className="space-y-2">
      {searches.map((search, index) => (
        <Link
          key={index}
          href={`/search?q=${encodeURIComponent(search.query)}`}
          className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              {index + 1}
            </div>
            <span className="text-sm font-medium">{search.query}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">{search.count}</div>
            <div
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                search.successRate >= 70
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : search.successRate >= 40
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {search.successRate}%
            </div>
          </div>
        </Link>
      ))}
      <div className="pt-2">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href="/search" className="flex items-center justify-center gap-1">
            <Search className="h-3.5 w-3.5" />
            <span>Go to Search</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
