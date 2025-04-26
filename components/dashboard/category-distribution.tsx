"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchCategoryDistribution } from "@/lib/api"

interface CategoryData {
  name: string
  count: number
  percentage: number
}

export function CategoryDistribution() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getCategoryDistribution = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch data with a timeout to prevent hanging
        const timeoutPromise = new Promise<CategoryData[]>((_, reject) => {
          setTimeout(() => reject(new Error("Request timeout")), 5000)
        })

        const dataPromise = fetchCategoryDistribution()

        // Race between the data fetch and the timeout
        const data = (await Promise.race([dataPromise, timeoutPromise])) as CategoryData[]

        // Validate the data structure
        if (!Array.isArray(data)) {
          console.error("Invalid data format for category distribution:", data)
          throw new Error("Invalid data format")
        }

        setCategories(data)
      } catch (error) {
        console.error("Failed to fetch category distribution:", error)

        // Fallback to hardcoded mock data as a last resort
        setCategories([
          { name: "Blueprints", count: 42, percentage: 27 },
          { name: "C++", count: 38, percentage: 24 },
          { name: "Animation", count: 24, percentage: 15 },
          { name: "Rendering", count: 18, percentage: 12 },
          { name: "Physics", count: 14, percentage: 9 },
          { name: "UI", count: 12, percentage: 8 },
          { name: "Audio", count: 8, percentage: 5 },
        ])

        setError("Using fallback data")
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

  if (categories.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No category data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          {error}
        </div>
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
