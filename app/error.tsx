"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="space-y-4 text-center max-w-md">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">{error.message || "An unexpected error has occurred."}</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
