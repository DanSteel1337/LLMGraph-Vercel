"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Import the form component with dynamic import and explicitly disable SSR
const DocumentUploadForm = dynamic(
  () => import("./document-upload-form").then((mod) => ({ default: mod.DocumentUploadForm })),
  {
    ssr: false,
    loading: () => <UploadFormSkeleton />,
  },
)

// Loading fallback component
function UploadFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  )
}

export function DocumentUploadFormContainer() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>Upload a document to be processed and indexed for search.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<UploadFormSkeleton />}>
          <DocumentUploadForm />
        </Suspense>
      </CardContent>
    </Card>
  )
}
