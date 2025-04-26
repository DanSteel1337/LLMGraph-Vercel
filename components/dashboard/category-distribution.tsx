"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { fetchCategoryDistribution } from "@/lib/api"

interface CategoryData {
  name: string
  count: number
  percentage: number
}

// Fallback data to use when the API request fails
const FALLBACK_DATA: CategoryData[] = [
  { name: "Blueprints", count: 42, percentage: 27 },
  { name: "C++", count: 38, percentage: 24 },
  { name: "Animation", count: 24, percentage: 15 },
  { name: "Rendering", count: 18, percentage: 12 },
  { name: "Physics", count: 14, percentage: 9 },
  { name: "UI", count: 12, percentage: 8 },
  { name: "Audio", count: 8, percentage: 5 },
]

export function CategoryDistribution() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getCategoryDistribution = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Set a longer timeout for the request
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

        try {
          const data = await fetchCategoryDistribution()
          clearTimeout(timeoutId)

          if (Array.isArray(data) && data.length > 0) {
            setCategories(data)
          } else {
            console.warn("Invalid data format for category distribution, using fallback data")
            setCategories(FALLBACK_DATA)
            setError("Using fallback data (invalid format)")
          }
        } catch (fetchError) {
          console.error("Failed to fetch category distribution:", fetchError)
          setCategories(FALLBACK_DATA)

          // Set a more specific error message
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
        console.error("Error in category distribution component:", error)
        setCategories(FALLBACK_DATA)
        setError("An unexpected error occurred - using fallback data")
      } finally {
        setIsLoading(false)
      }
    }

    getCategoryDistribution()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="warning" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div key={category.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{category.name}</span>
              <span className="text-sm text-muted-foreground">{category.count} docs</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${category.percentage}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{category.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
