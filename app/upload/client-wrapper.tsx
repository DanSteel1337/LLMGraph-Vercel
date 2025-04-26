"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// Import the form component with dynamic import
const DocumentUploadFormWrapper = dynamic(() => import("@/components/upload/document-upload-form-wrapper"), {
  ssr: false,
  loading: () => <UploadFormSkeleton />,
})

// Loading fallback component
function UploadFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
      <div className="flex justify-between p-6 pt-0">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-36" />
      </div>
    </Card>
  )
}

export function UploadClientWrapper() {
  return (
    <Suspense fallback={<UploadFormSkeleton />}>
      <DocumentUploadFormWrapper />
    </Suspense>
  )
}
