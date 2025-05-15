import { Suspense } from "react"
import { DocumentManagement } from "@/components/documents/document-management"

export default function DocumentsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Document Management</h1>

      <Suspense fallback={<div>Loading documents...</div>}>
        <DocumentManagement />
      </Suspense>
    </div>
  )
}
