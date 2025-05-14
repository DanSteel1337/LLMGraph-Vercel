"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, FileText, Code, Database } from "lucide-react"

interface DocumentPreviewProps {
  documentId: string
}

interface DocumentChunk {
  id: string
  content: string
  metadata: {
    page: number
    chunk: number
  }
}

export function DocumentPreview({ documentId }: DocumentPreviewProps) {
  const [document, setDocument] = useState<any>(null)
  const [chunks, setChunks] = useState<DocumentChunk[]>([])
  const [vectors, setVectors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeChunk, setActiveChunk] = useState(0)
  const [activeTab, setActiveTab] = useState("content")

  useEffect(() => {
    const fetchDocumentData = async () => {
      setIsLoading(true)
      try {
        // Fetch document metadata
        const docResponse = await fetch(`/api/documents/${documentId}`)
        if (!docResponse.ok) throw new Error("Failed to fetch document")
        const docData = await docResponse.json()
        setDocument(docData)

        // Fetch document chunks
        const chunksResponse = await fetch(`/api/documents/${documentId}/chunks`)
        if (!chunksResponse.ok) throw new Error("Failed to fetch chunks")
        const chunksData = await chunksResponse.json()
        setChunks(chunksData)

        // Fetch vector embeddings
        const vectorsResponse = await fetch(`/api/documents/${documentId}/vectors`)
        if (!vectorsResponse.ok) throw new Error("Failed to fetch vectors")
        const vectorsData = await vectorsResponse.json()
        setVectors(vectorsData)
      } catch (error) {
        console.error("Error fetching document data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (documentId) {
      fetchDocumentData()
    }
  }, [documentId])

  const nextChunk = () => {
    if (activeChunk < chunks.length - 1) {
      setActiveChunk(activeChunk + 1)
    }
  }

  const prevChunk = () => {
    if (activeChunk > 0) {
      setActiveChunk(activeChunk - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  if (!document) {
    return <div className="text-center py-8">Document not found</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">{document.title}</h3>
        <p className="text-sm text-muted-foreground">
          {document.category} • {document.metadata?.version || "No version"} •
          {new Date(document.created_at).toLocaleDateString()}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="content" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="chunks" className="flex items-center gap-1">
            <Code className="h-4 w-4" />
            Chunks ({chunks.length})
          </TabsTrigger>
          <TabsTrigger value="vectors" className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            Vectors ({vectors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: document.content || "No content available" }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chunks" className="mt-4">
          {chunks.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Chunk {activeChunk + 1} of {chunks.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={prevChunk} disabled={activeChunk === 0}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextChunk}
                    disabled={activeChunk === chunks.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-mono whitespace-pre-wrap bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
                    {chunks[activeChunk]?.content || "No content"}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Metadata: Page {chunks[activeChunk]?.metadata?.page || "N/A"}, Chunk{" "}
                    {chunks[activeChunk]?.metadata?.chunk || "N/A"}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No chunks available</div>
          )}
        </TabsContent>

        <TabsContent value="vectors" className="mt-4">
          {vectors.length > 0 ? (
            <Card>
              <CardContent className="p-4">
                <div className="text-sm">
                  <p className="mb-2">Vector count: {vectors.length}</p>
                  <p className="mb-2">Dimensions: {vectors[0]?.values?.length || "Unknown"}</p>
                  <p className="mb-4">Namespace: {vectors[0]?.namespace || "default"}</p>

                  <div className="overflow-auto max-h-[300px]">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">ID</th>
                          <th className="text-left py-2 px-3">Metadata</th>
                          <th className="text-left py-2 px-3">Vector Preview</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vectors.map((vector, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 px-3 font-mono">{vector.id.substring(0, 8)}...</td>
                            <td className="py-2 px-3">
                              {vector.metadata ? (
                                <pre className="text-xs overflow-auto max-w-[200px]">
                                  {JSON.stringify(vector.metadata, null, 2)}
                                </pre>
                              ) : (
                                "No metadata"
                              )}
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-mono text-xs truncate max-w-[200px]">
                                [
                                {vector.values
                                  .slice(0, 5)
                                  .map((v) => v.toFixed(4))
                                  .join(", ")}
                                ...]
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No vector data available</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
