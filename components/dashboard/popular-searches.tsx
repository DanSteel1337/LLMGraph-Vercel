"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, TrendingUp, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPopularSearches } from "@/lib/db"

type PopularSearch = {
  query: string
  count: number
}

export function PopularSearches() {
  const [searches, setSearches] = useState<PopularSearch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPopularSearches() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getPopularSearches()
        setSearches(data)
      } catch (err) {
        console.error("Error loading popular searches:", err)
        setError("Failed to load popular searches")
      } finally {
        setIsLoading(false)
      }
    }

    loadPopularSearches()
  }, [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Popular Searches</CardTitle>
        <CardDescription>Most frequently searched terms</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : searches.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No search data available yet</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/search">Try searching</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {searches.map((search, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  {index < 3 ? (
                    <TrendingUp className="h-5 w-5 text-primary" />
                  ) : (
                    <Search className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium leading-none">{search.query}</p>
                  <p className="text-sm text-muted-foreground">{search.count} searches</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/search?q=${encodeURIComponent(search.query)}`}>Search</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
