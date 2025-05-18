"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, FileText, Database, Code, AlertCircle } from "lucide-react"
import { shouldUseMockData } from "@/lib/environment"
import { apiClient } from "@/lib/api-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DocumentPreviewModalProps {
  documentId: string
  isOpen: boolean
  onClose: () => void
}

interface DocumentData {
  id: string
  title: string
  content: string
  metadata: any
  createdAt: string
  updatedAt: string
}

interface ChunkData {
  id: string
  content: string
  metadata: any
}

interface VectorData {
  id: string
  metadata: any
  values?: number[]
  score?: number
}

// Mock data for development
const MOCK_DOCUMENT: DocumentData = {
  id: "mock-doc-1",
  title: "Getting Started with Unreal Engine",
  content:
    "This is a sample document content for the Unreal Engine documentation.\n\nUnreal Engine is a complete suite of creation tools designed to meet ambitious artistic visions while being flexible enough to ensure success for teams of all sizes.\n\nAs a proven, comprehensive toolset that has delivered hundreds of games, Unreal Engine provides a solid foundation for your team to build upon.",
  metadata: {
    version: "5.4",
    category: "Beginner",
    author: "Epic Games",
    tags: ["getting-started", "basics", "introduction"],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const MOCK_CHUNKS: ChunkData[] = [
  {
    id: "chunk-1",
    content: "This is a sample document content for the Unreal Engine documentation.",
    metadata: { index: 0, documentId: "mock-doc-1" },
  },
  {
    id: "chunk-2",
    content:
      "Unreal Engine is a complete suite of creation tools designed to meet ambitious artistic visions while being flexible enough to ensure success for teams of all sizes.",
    metadata: { index: 1, documentId: "mock-doc-1" },
  },
  {
    id: "chunk-3",
    content:
      "As a proven, comprehensive toolset that has delivered hundreds of games, Unreal Engine provides a solid foundation for your team to build upon.",
    metadata: { index: 2, documentId: "mock-doc-1" },
  },
]

const MOCK_VECTORS: VectorData[] = [
  {
    id: "vector-1",
    metadata: { chunkId: "chunk-1", documentId: "mock-doc-1" },
    values: Array(10)
      .fill(0)
      .map(() => Math.random() * 2 - 1),
    score: 0.95,
  },
  {
    id: "vector-2",
    metadata: { chunkId: "chunk-2", documentId: "mock-doc-1" },
    values: Array(10)
      .fill(0)
      .map(() => Math.random() * 2 - 1),
    score: 0.87,
  },
  {
    id: "vector-3",
    metadata: { chunkId: "chunk-3", documentId: "mock-doc-1" },
    values: Array(10)
      .fill(0)
      .map(() => Math.random() * 2 - 1),
    score: 0.82,
  },
]

export function DocumentPreviewModal({ documentId, isOpen, onClose }: DocumentPreviewModalProps) {
  const [document, setDocument] = useState<DocumentData | null>(null)
  const [chunks, setChunks] = useState<ChunkData[]>([])
  const [vectors, setVectors] = useState<VectorData[]>([])
  const [loading, setLoading] = useState({
    document: true,
    chunks: false,
    vectors: false,
  })
  const [activeTab, setActiveTab] = useState("document")
  const [isMockData, setIsMockData] = useState(false)

  useEffect(() => {
    if (isOpen && documentId) {
      fetchDocument()
    }
  }, [isOpen, documentId])

  const fetchDocument = async () => {
    setLoading((prev) => ({ ...prev, document: true }))
    try {
      // Check if we should use mock data
      if (shouldUseMockData()) {
        setDocument(MOCK_DOCUMENT)
        setIsMockData(true)
        setLoading((prev) => ({ ...prev, document: false }))
        return
      }

      const response = await apiClient.get(`/documents/${documentId}`)
      if (!response.ok) throw new Error("Failed to fetch document")

      const data = await response.json()
      setDocument(data)
      setIsMockData(data.isMockData || false)
    } catch (error) {
      console.error("Error fetching document:", error)
    } finally {
      setLoading((prev) => ({ ...prev, document: false }))
    }
  }

  const fetchChunks = async () => {
    if (chunks.length > 0) return
    setLoading((prev) => ({ ...prev, chunks: true }))
    try {
      // Check if we should use mock data
      if (shouldUseMockData() || isMockData) {
        setChunks(MOCK_CHUNKS)
        setLoading((prev) => ({ ...prev, chunks: false }))
        return
      }

      const response = await apiClient.get(`/documents/${documentId}/chunks`)
      if (!response.ok) throw new Error("Failed to fetch chunks")

      const data = await response.json()
      setChunks(data)
    } catch (error) {
      console.error("Error fetching chunks:", error)
    } finally {
      setLoading((prev) => ({ ...prev, chunks: false }))
    }
  }

  const fetchVectors = async () => {
    if (vectors.length > 0) return
    setLoading((prev) => ({ ...prev, vectors: true }))
    try {
      // Check if we should use mock data
      if (shouldUseMockData() || isMockData) {
        setVectors(MOCK_VECTORS)
        setLoading((prev) => ({ ...prev, vectors: false }))
        return
      }

      const response = await apiClient.get(`/documents/${documentId}/vectors`)
      if (!response.ok) throw new Error("Failed to fetch vectors")

      const data = await response.json()
      setVectors(data)
    } catch (error) {
      console.error("Error fetching vectors:", error)
    } finally {
      setLoading((prev) => ({ ...prev, vectors: false }))
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "chunks") fetchChunks()
    if (value === "vectors") fetchVectors()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{document?.title || "Document Preview"}</DialogTitle>
          <DialogDescription>
            ID: {documentId}
            {document?.createdAt && ` • Created: ${new Date(document.createdAt).toLocaleString()}`}
          </DialogDescription>
        </DialogHeader>

        {isMockData && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Preview Mode</AlertTitle>
            <AlertDescription>
              You are viewing mock document data. Connect to a database in production for real data.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="document" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Document
            </TabsTrigger>
            <TabsTrigger value="chunks" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              Chunks
            </TabsTrigger>
            <TabsTrigger value="vectors" className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              Vectors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="document" className="flex-1 overflow-auto">
            {loading.document ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : document ? (
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap">{document.content}</pre>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-2">Metadata</h3>
                    <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                      {JSON.stringify(document.metadata, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-8">Document not found</div>
            )}
          </TabsContent>

          <TabsContent value="chunks" className="flex-1 overflow-auto">
            {loading.chunks ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : chunks.length > 0 ? (
              <div className="space-y-4">
                {chunks.map((chunk, index) => (
                  <Card key={chunk.id || index}>
                    <CardContent className="pt-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Chunk {index + 1}</h3>
                      <div className="prose max-w-none mb-4">
                        <pre className="whitespace-pre-wrap">{chunk.content}</pre>
                      </div>
                      <details className="text-sm">
                        <summary className="cursor-pointer text-muted-foreground">Metadata</summary>
                        <pre className="bg-muted p-2 rounded-md overflow-auto mt-2">
                          {JSON.stringify(chunk.metadata, null, 2)}
                        </pre>
                      </details>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-8">No chunks found</div>
            )}
          </TabsContent>

          <TabsContent value="vectors" className="flex-1 overflow-auto">
            {loading.vectors ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : vectors.length > 0 ? (
              <div className="space-y-4">
                {vectors.map((vector, index) => (
                  <Card key={vector.id || index}>
                    <CardContent className="pt-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Vector {index + 1}</h3>
                      <details className="text-sm mb-2">
                        <summary className="cursor-pointer text-muted-foreground">Metadata</summary>
                        <pre className="bg-muted p-2 rounded-md overflow-auto mt-2">
                          {JSON.stringify(vector.metadata, null, 2)}
                        </pre>
                      </details>
                      {vector.values && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground">
                            Vector Values ({vector.values.length} dimensions)
                          </summary>
                          <div className="bg-muted p-2 rounded-md overflow-auto mt-2 max-h-32">
                            <div className="text-xs font-mono">
                              [
                              {vector.values
                                .slice(0, 10)
                                .map((v) => v.toFixed(6))
                                .join(", ")}
                              {vector.values.length > 10 ? ", ..." : ""}]
                            </div>
                          </div>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-8">No vectors found</div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
