import { DocumentDetailView } from "@/components/admin/document-detail-view"

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Document Details</h1>
      <DocumentDetailView documentId={params.id} />
    </div>
  )
}
