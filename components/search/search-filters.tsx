"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchCategories, fetchVersions } from "@/lib/api"

interface SearchFiltersProps {
  filters: {
    categories: string[]
    versions: string[]
  }
  onChange: (filters: { categories: string[]; versions: string[] }) => void
  onApply: () => void
}

export function SearchFilters({ filters, onChange, onApply }: SearchFiltersProps) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [versions, setVersions] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [categoriesData, versionsData] = await Promise.all([fetchCategories(), fetchVersions()])

        setCategories(categoriesData)
        setVersions(versionsData)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to load filters:", error)
        setIsLoading(false)
      }
    }

    loadFilters()
  }, [])

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    onChange({
      ...filters,
      categories: checked ? [...filters.categories, categoryId] : filters.categories.filter((id) => id !== categoryId),
    })
  }

  const handleVersionChange = (versionId: string, checked: boolean) => {
    onChange({
      ...filters,
      versions: checked ? [...filters.versions, versionId] : filters.versions.filter((id) => id !== versionId),
    })
  }

  const handleReset = () => {
    onChange({
      categories: [],
      versions: [],
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Refine your search results</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Categories</h3>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Engine Versions</h3>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {versions.map((version) => (
                <div key={version.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`version-${version.id}`}
                    checked={filters.versions.includes(version.id)}
                    onCheckedChange={(checked) => handleVersionChange(version.id, checked as boolean)}
                  />
                  <label
                    htmlFor={`version-${version.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {version.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={handleReset}>
          Reset
        </Button>
        <Button size="sm" onClick={onApply}>
          Apply Filters
        </Button>
      </CardFooter>
    </Card>
  )
}
