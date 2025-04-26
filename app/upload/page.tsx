import { UploadClientWrapper } from "./client-wrapper"

export default function UploadPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Documents</h1>
        <p className="text-muted-foreground">Add new Unreal Engine documentation to the RAG system</p>
      </div>

      <UploadClientWrapper />
    </div>
  )
}

// Disable static generation for this page
export const dynamic = "force-dynamic"
