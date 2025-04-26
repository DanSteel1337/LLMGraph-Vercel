import { DocumentUploadForm } from "@/components/upload/document-upload-form"

export default function UploadPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Documents</h1>
        <p className="text-muted-foreground">Add new Unreal Engine documentation to the RAG system</p>
      </div>

      <DocumentUploadForm />
    </div>
  )
}
