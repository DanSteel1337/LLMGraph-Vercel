import { DocumentManagement } from "@/components/documents/document-management"

export default function DocumentsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manage Documents</h1>
        <p className="text-muted-foreground">View, edit, and delete documents in the RAG system</p>
      </div>

      <DocumentManagement />
    </div>
  )
}
