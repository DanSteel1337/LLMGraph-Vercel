"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function SettingsForm() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Use computed values for client-side settings rather than environment variables
  // This avoids unnecessary environment configuration and deployment issues
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Vector RAG Dashboard",
    siteDescription: "A dashboard for managing vector-based RAG systems",
    apiUrl: typeof window !== "undefined" ? `${window.location.origin}/api` : "/api",
    useMockData: process.env.USE_MOCK_DATA === "true",
  })

  const [embeddingSettings, setEmbeddingSettings] = useState({
    model: "text-embedding-3-small",
    dimensions: 1536,
    chunkSize: 1000,
    chunkOverlap: 200,
  })

  const [pineconeSettings, setPineconeSettings] = useState({
    indexName: process.env.PINECONE_INDEX_NAME || "",
    namespace: "default",
    metric: "cosine",
  })

  const validateSettings = (settings) => {
    // Ensure API URL is valid
    if (!settings.apiUrl) {
      return { valid: false, message: "API URL cannot be empty" }
    }

    // Ensure API URL is properly formatted
    if (!settings.apiUrl.startsWith("/api") && !settings.apiUrl.startsWith("http")) {
      return { valid: false, message: "API URL must start with '/api' or include a full URL" }
    }

    return { valid: true }
  }

  const handleSaveGeneral = async () => {
    setLoading(true)
    try {
      // Validate settings before saving
      const validation = validateSettings(generalSettings)
      if (!validation.valid) {
        toast({
          title: "Validation Error",
          description: validation.message,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings saved",
        description: "General settings have been updated successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEmbedding = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings saved",
        description: "Embedding settings have been updated successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePinecone = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings saved",
        description: "Pinecone settings have been updated successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your application settings</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="embedding">Embedding</TabsTrigger>
          <TabsTrigger value="pinecone">Pinecone</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apiUrl">API URL</Label>
                <Input
                  id="apiUrl"
                  value={generalSettings.apiUrl}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, apiUrl: e.target.value })}
                  placeholder="/api"
                />
                <p className="text-xs text-muted-foreground">
                  Default is "/api" or the current origin + "/api". No environment variable needed.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="useMockData"
                  checked={generalSettings.useMockData}
                  onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, useMockData: checked })}
                />
                <Label htmlFor="useMockData">Use Mock Data</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneral} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="embedding" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Embedding Settings</CardTitle>
              <CardDescription>Configure embedding model and chunking parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="embeddingModel">Embedding Model</Label>
                <Select
                  value={embeddingSettings.model}
                  onValueChange={(value) => setEmbeddingSettings({ ...embeddingSettings, model: value })}
                >
                  <SelectTrigger id="embeddingModel">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
                    <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
                    <SelectItem value="text-embedding-ada-002">text-embedding-ada-002 (Legacy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  type="number"
                  value={embeddingSettings.dimensions}
                  onChange={(e) =>
                    setEmbeddingSettings({ ...embeddingSettings, dimensions: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="chunkSize">Chunk Size</Label>
                <Input
                  id="chunkSize"
                  type="number"
                  value={embeddingSettings.chunkSize}
                  onChange={(e) =>
                    setEmbeddingSettings({ ...embeddingSettings, chunkSize: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="chunkOverlap">Chunk Overlap</Label>
                <Input
                  id="chunkOverlap"
                  type="number"
                  value={embeddingSettings.chunkOverlap}
                  onChange={(e) =>
                    setEmbeddingSettings({ ...embeddingSettings, chunkOverlap: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveEmbedding} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="pinecone" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pinecone Settings</CardTitle>
              <CardDescription>Configure Pinecone vector database settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="indexName">Index Name</Label>
                <Input
                  id="indexName"
                  value={pineconeSettings.indexName}
                  onChange={(e) => setPineconeSettings({ ...pineconeSettings, indexName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="namespace">Namespace</Label>
                <Input
                  id="namespace"
                  value={pineconeSettings.namespace}
                  onChange={(e) => setPineconeSettings({ ...pineconeSettings, namespace: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metric">Distance Metric</Label>
                <Select
                  value={pineconeSettings.metric}
                  onValueChange={(value) => setPineconeSettings({ ...pineconeSettings, metric: value })}
                >
                  <SelectTrigger id="metric">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cosine">Cosine</SelectItem>
                    <SelectItem value="euclidean">Euclidean</SelectItem>
                    <SelectItem value="dotproduct">Dot Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePinecone} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
