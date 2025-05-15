"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>A global error occurred in the application.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                <p>Error: {error.message || "Unknown error"}</p>
                {error.digest && <p className="mt-2 text-xs text-gray-500">Error ID: {error.digest}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => (window.location.href = "/")}>
                Go Home
              </Button>
              <Button onClick={() => reset()}>Try Again</Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  )
}
