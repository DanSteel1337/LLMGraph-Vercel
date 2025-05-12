"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">An unexpected error has occurred.</p>
            <Button onClick={() => reset()}>Try again</Button>
          </div>
        </div>
      </body>
    </html>
  )
}
