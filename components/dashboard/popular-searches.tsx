"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { fetchPopularSearches } from "@/lib/api"

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
