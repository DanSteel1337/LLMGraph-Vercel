import { DocumentUploadForm } from "@/components/upload/document-upload-form"
import { BatchUpload } from "@/components/upload/batch-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UploadPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Upload Documents</h1>

      <Tabs defaultValue="single" className="w-full max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="single">Single Document</TabsTrigger>
          <TabsTrigger value="batch">Batch Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
          <DocumentUploadForm />
        </TabsContent>
        <TabsContent value="batch">
          <BatchUpload />
        </TabsContent>
      </Tabs>
    </div>
  )
}
