"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface FileItem {
  file: File
  title: string
  category: string
  version: string
  status: "pending" | "uploading" | "success" | "error"
  progress: number
  error?: string
}

export function BatchUpload() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [defaultCategory, setDefaultCategory] = useState("")
  const [defaultVersion, setDefaultVersion] = useState("")
  const { toast } = useToast()

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        title: file.name.replace(/\.[^/.]+$/, ""),
        category: defaultCategory,
        version: defaultVersion,
        status: "pending" as const,
        progress: 0,
      }))
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const updateFileField = (index: number, field: keyof FileItem, value: string) => {
    setFiles((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setIsUploading(true)

    // Create a copy of files to update during upload
    const updatedFiles = [...files]

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "success") continue

      try {
        // Update status to uploading
        updatedFiles[i] = { ...updatedFiles[i], status: "uploading", progress: 0 }
        setFiles([...updatedFiles])

        // Create form data
        const formData = new FormData()
        formData.append("file", files[i].file)
        formData.append("title", files[i].title)
        formData.append("category", files[i].category)
        formData.append("version", files[i].version)

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          updatedFiles[i] = {
            ...updatedFiles[i],
            progress: Math.min(95, updatedFiles[i].progress + 5),
          }
          setFiles([...updatedFiles])
        }, 300)

        // Upload file
        const response = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || response.statusText)
        }

        // Update status to success
        updatedFiles[i] = { ...updatedFiles[i], status: "success", progress: 100 }
        setFiles([...updatedFiles])
      } catch (error) {
        console.error(`Error uploading ${files[i].file.name}:`, error)

        // Update status to error
        updatedFiles[i] = {
          ...updatedFiles[i],
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        }
        setFiles([...updatedFiles])
      }
    }

    setIsUploading(false)

    const successCount = updatedFiles.filter((f) => f.status === "success").length
    if (successCount > 0) {
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${successCount} of ${files.length} documents.`,
      })
    }
  }

  const getStatusColor = (status: FileItem["status"]) => {
    switch (status) {
      case "success":
        return "text-green-500"
      case "error":
        return "text-red-500"
      case "uploading":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="defaultCategory">Default Category</Label>
            <Select value={defaultCategory} onValueChange={setDefaultCategory}>
              <SelectTrigger id="defaultCategory">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Blueprints">Blueprints</SelectItem>
                <SelectItem value="C++">C++</SelectItem>
                <SelectItem value="Animation">Animation</SelectItem>
                <SelectItem value="Rendering">Rendering</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="UI">UI</SelectItem>
                <SelectItem value="Audio">Audio</SelectItem>
                <SelectItem value="Networking">Networking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultVersion">Default Version</Label>
            <Select value={defaultVersion} onValueChange={setDefaultVersion}>
              <SelectTrigger id="defaultVersion">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UE 5.3">UE 5.3</SelectItem>
                <SelectItem value="UE 5.2">UE 5.2</SelectItem>
                <SelectItem value="UE 5.1">UE 5.1</SelectItem>
                <SelectItem value="UE 5.0">UE 5.0</SelectItem>
                <SelectItem value="UE 4.27">UE 4.27</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="files">Select Files</Label>
          <Input
            id="files"
            type="file"
            multiple
            accept=".pdf,.txt,.md,.doc,.docx"
            onChange={handleFilesChange}
            disabled={isUploading}
          />
          <p className="text-xs text-muted-foreground">
            Accepted formats: PDF, TXT, MD, DOC, DOCX. Maximum size: 10MB per file
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Files to Upload ({files.length})</h3>

          <div className="border rounded-md overflow-hidden">
            <div className="grid grid-cols-12 gap-2 p-3 bg-muted text-xs font-medium">
              <div className="col-span-4">File</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Version</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-1"></div>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-3 border-t items-center text-sm">
                  <div className="col-span-4 truncate" title={file.title}>
                    {file.title}
                  </div>

                  <div className="col-span-2">
                    <Select
                      value={file.category}
                      onValueChange={(value) => updateFileField(index, "category", value)}
                      disabled={isUploading || file.status === "success"}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Blueprints">Blueprints</SelectItem>
                        <SelectItem value="C++">C++</SelectItem>
                        <SelectItem value="Animation">Animation</SelectItem>
                        <SelectItem value="Rendering">Rendering</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="UI">UI</SelectItem>
                        <SelectItem value="Audio">Audio</SelectItem>
                        <SelectItem value="Networking">Networking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Select
                      value={file.version}
                      onValueChange={(value) => updateFileField(index, "version", value)}
                      disabled={isUploading || file.status === "success"}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Version" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UE 5.3">UE 5.3</SelectItem>
                        <SelectItem value="UE 5.2">UE 5.2</SelectItem>
                        <SelectItem value="UE 5.1">UE 5.1</SelectItem>
                        <SelectItem value="UE 5.0">UE 5.0</SelectItem>
                        <SelectItem value="UE 4.27">UE 4.27</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-3">
                    {file.status === "uploading" ? (
                      <div className="space-y-1">
                        <Progress value={file.progress} className="h-1" />
                        <p className="text-xs text-muted-foreground">{file.progress}%</p>
                      </div>
                    ) : (
                      <span className={getStatusColor(file.status)}>
                        {file.status === "pending" && "Ready to upload"}
                        {file.status === "success" && "Upload complete"}
                        {file.status === "error" && (file.error || "Upload failed")}
                      </span>
                    )}
                  </div>

                  <div className="col-span-1 text-right">
                    {file.status !== "uploading" && (
                      <Button variant="ghost" size="icon" onClick={() => removeFile(index)} disabled={isUploading}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setFiles([])} disabled={isUploading}>
              Clear All
            </Button>

            <Button onClick={uploadFiles} disabled={isUploading || files.length === 0}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload All
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
