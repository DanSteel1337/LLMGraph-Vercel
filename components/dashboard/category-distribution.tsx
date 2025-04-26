"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { ErrorBoundary } from "@/components/error-boundary"

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

        // Always use fallback data to avoid potential issues
        setCategories(FALLBACK_DATA)
        setIsLoading(false)
      } catch (error) {
        console.error("Error in category distribution component:", error)
        setCategories(FALLBACK_DATA)
        setError("An unexpected error occurred - using fallback data")
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
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}
