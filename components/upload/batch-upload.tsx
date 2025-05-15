"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Upload, FileUp, CheckCircle, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function BatchUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{ success: string[]; failed: string[] }>({
    success: [],
    failed: [],
  })
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files).filter((file) => file.type === "application/pdf")
      setFiles(fileArray)
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select PDF files to upload",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setProgress(0)
    setResults({ success: [], failed: [] })

    const successFiles: string[] = []
    const failedFiles: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          successFiles.push(file.name)
        } else {
          failedFiles.push(file.name)
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        failedFiles.push(file.name)
      }

      // Update progress
      setProgress(Math.round(((i + 1) / files.length) * 100))
    }

    setResults({
      success: successFiles,
      failed: failedFiles,
    })

    setUploading(false)

    toast({
      title: "Upload complete",
      description: `Successfully uploaded ${successFiles.length} files. Failed to upload ${failedFiles.length} files.`,
      variant: successFiles.length > 0 && failedFiles.length === 0 ? "default" : "destructive",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Upload</CardTitle>
        <CardDescription>Upload multiple PDF documents at once</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="batch-upload">PDF Files</Label>
          <div className="flex items-center gap-2">
            <Input
              id="batch-upload"
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileChange}
              disabled={uploading}
              className="flex-1"
            />
            <Button variant="outline" onClick={() => setFiles([])} disabled={uploading || files.length === 0}>
              Clear
            </Button>
          </div>
          {files.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {results.success.length > 0 && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Successfully uploaded {results.success.length} files
                </h3>
                {results.success.length <= 5 && (
                  <div className="mt-2 text-sm text-green-700">
                    <ul className="list-disc space-y-1 pl-5">
                      {results.success.map((file, index) => (
                        <li key={index}>{file}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {results.failed.length > 0 && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Failed to upload {results.failed.length} files</h3>
                {results.failed.length <= 5 && (
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc space-y-1 pl-5">
                      {results.failed.map((file, index) => (
                        <li key={index}>{file}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={uploading || files.length === 0} className="w-full">
          {uploading ? (
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4 animate-pulse" />
              Uploading...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              Upload {files.length} File{files.length !== 1 ? "s" : ""}
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
