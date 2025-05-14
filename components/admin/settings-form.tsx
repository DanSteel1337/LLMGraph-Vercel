"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function SettingsForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // System settings
  const [chunkSize, setChunkSize] = useState(1000)
  const [chunkOverlap, setChunkOverlap] = useState(200)
  const [embeddingModel, setEmbeddingModel] = useState("text-embedding-ada-002")
  const [useMockData, setUseMockData] = useState(false)

  // Search settings
  const [topK, setTopK] = useState(5)
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7)
  const [enableRag, setEnableRag] = useState(true)

  const handleSaveSettings = async () => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs defaultValue="system" className="space-y-4">
      <TabsList>
        <TabsTrigger value="system">System</TabsTrigger>
        <TabsTrigger value="search">Search</TabsTrigger>
        <TabsTrigger value="api">API</TabsTrigger>
      </TabsList>

      <TabsContent value="system">
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Configure system-wide settings for document processing and embeddings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="chunkSize">Chunk Size (characters)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="chunkSize"
                    min={100}
                    max={2000}
                    step={100}
                    value={[chunkSize]}
                    onValueChange={(value) => setChunkSize(value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-right">{chunkSize}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Size of text chunks for document processing</p>
              </div>

              <div>
                <Label htmlFor="chunkOverlap">Chunk Overlap (characters)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="chunkOverlap"
                    min={0}
                    max={500}
                    step={50}
                    value={[chunkOverlap]}
                    onValueChange={(value) => setChunkOverlap(value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-right">{chunkOverlap}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Overlap between consecutive chunks</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="embeddingModel">Embedding Model</Label>
              <Select value={embeddingModel} onValueChange={setEmbeddingModel}>
                <SelectTrigger id="embeddingModel">
                  <SelectValue placeholder="Select embedding model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-embedding-ada-002">OpenAI Ada 002</SelectItem>
                  <SelectItem value="text-embedding-3-small">OpenAI Embedding 3 Small</SelectItem>
                  <SelectItem value="text-embedding-3-large">OpenAI Embedding 3 Large</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Model used for generating vector embeddings</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mockData">Use Mock Data</Label>
                <p className="text-xs text-muted-foreground">Use mock data instead of real API calls</p>
              </div>
              <Switch id="mockData" checked={useMockData} onCheckedChange={setUseMockData} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="search">
        <Card>
          <CardHeader>
            <CardTitle>Search Settings</CardTitle>
            <CardDescription>Configure search behavior and RAG settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="topK">Results per Search (Top K)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="topK"
                  min={1}
                  max={20}
                  step={1}
                  value={[topK]}
                  onValueChange={(value) => setTopK(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-right">{topK}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Number of results to return for each search query</p>
            </div>

            <div>
              <Label htmlFor="similarityThreshold">Similarity Threshold</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="similarityThreshold"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[similarityThreshold]}
                  onValueChange={(value) => setSimilarityThreshold(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-right">{similarityThreshold}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Minimum similarity score for search results (0-1)</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableRag">Enable RAG</Label>
                <p className="text-xs text-muted-foreground">Use Retrieval Augmented Generation for AI responses</p>
              </div>
              <Switch id="enableRag" checked={enableRag} onCheckedChange={setEnableRag} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="api">
        <Card>
          <CardHeader>
            <CardTitle>API Settings</CardTitle>
            <CardDescription>Configure API keys and endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openaiKey">OpenAI API Key</Label>
              <Input
                id="openaiKey"
                type="password"
                placeholder="sk-..."
                value="sk-••••••••••••••••••••••••••••••"
                disabled
              />
              <p className="text-xs text-muted-foreground">Set in environment variables</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pineconeKey">Pinecone API Key</Label>
              <Input
                id="pineconeKey"
                type="password"
                placeholder="..."
                value="••••••••••••••••••••••••••••••"
                disabled
              />
              <p className="text-xs text-muted-foreground">Set in environment variables</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pineconeIndex">Pinecone Index</Label>
              <Input id="pineconeIndex" placeholder="Index name" value="unrealengine54" disabled />
              <p className="text-xs text-muted-foreground">Set in environment variables</p>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              API keys are managed through environment variables and cannot be changed here.
            </p>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
