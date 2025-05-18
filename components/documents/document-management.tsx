"use client"

import { useState, useEffect } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Pencil, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { DocumentEditDialog } from "./document-edit-dialog"
import { shouldUseMockData } from "@/lib/environment"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import apiClient from "@/lib/api-client"
import type { Document } from "@/types/documents"

// Mock data for development when USE_MOCK_DATA is true
const MOCK_DOCUMENTS = [
  {
    id: "1",
    title: "Getting Started with Unreal Engine",
    category: "Beginner",
    version: "5.4",
    uploadedAt: new Date().toISOString(),
    status: "processed" as const,
    size: 1024 * 1024 * 2.5, // 2.5 MB
  },
  {
    id: "2",
    title: "Blueprint Basics",
    category: "Programming",
    version: "5.4",
    uploadedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    status: "processed" as const,
    size: 1024 * 1024 * 1.2, // 1.2 MB
  },
  {
    id: "3",
    title: "Material System Overview",
    category: "Graphics",
    version: "5.3",
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    status: "processed" as const,
    size: 1024 * 1024 * 3.7, // 3.7 MB
  },
  {
    id: "4",
    title: "Animation Blueprint Guide",
    category: "Animation",
    version: "5.4",
    uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    status: "processing" as const,
    size: 1024 * 1024 * 5.1, // 5.1 MB
  },
  {
    id: "5",
    title: "Physics Simulation Tutorial",
    category: "Physics",
    version: "5.2",
    uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    status: "failed" as const,
    size: 1024 * 1024 * 1.8, // 1.8 MB
  },
]

export function DocumentManagement() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMockData, setIsMockData] = useState(false)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Use mock data if in preview environment
        if (shouldUseMockData()) {
          setDocuments(MOCK_DOCUMENTS)
          setIsMockData(true)
          return
        }

        // Use the API client instead of direct Supabase calls
        const response = await apiClient.documents.getAll()

        if (!response.success) {
          throw new Error(response.error || "Failed to fetch documents")
        }

        if (!response.data) {
          setDocuments([])
          return
        }

        setDocuments(response.data)
      } catch (error) {
        console.error("Failed to fetch documents:", error)
        setError("Failed to load documents. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load documents. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  const handleDeleteDocument = async (id: string) => {
    try {
      // Use mock data if in preview environment
      if (shouldUseMockData()) {
        // Just remove from local state for mock data
        setDocuments(documents.filter((doc) => doc.id !== id))
        toast({
          title: "Document deleted",
          description: "The document has been deleted successfully.",
        })
        return
      }

      // Use the API client instead of direct Supabase calls
      const response = await apiClient.documents.delete(id)

      if (!response.success) {
        throw new Error(response.error || "Failed to delete document")
      }

      setDocuments(documents.filter((doc) => doc.id !== id))
      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete document:", error)
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<Document>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <div>{row.getValue("category")}</div>,
    },
    {
      accessorKey: "version",
      header: "Version",
      cell: ({ row }) => <div>{row.getValue("version")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status === "processed" ? "default" : status === "processing" ? "outline" : "destructive"}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "size",
      header: () => <div className="text-right">Size</div>,
      cell: ({ row }) => {
        const size = Number.parseInt(row.getValue("size"))
        const formatted =
          size < 1024
            ? `${size} B`
            : size < 1024 * 1024
              ? `${(size / 1024).toFixed(1)} KB`
              : `${(size / (1024 * 1024)).toFixed(1)} MB`

        return <div className="text-right font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "uploadedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="justify-end w-full"
          >
            Uploaded
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("uploadedAt"))
        return <div className="text-right">{date.toLocaleDateString()}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const document = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(document.id)}>
                Copy document ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditingDocument(document)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteDocument(document.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: documents,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold mb-2">Error</h3>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {isMockData && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Preview Mode</AlertTitle>
          <AlertDescription>
            You are viewing mock document data. Connect to a database in production for real data.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter documents..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={() => setRowSelection({})}>
            Clear selection
          </Button>
        </div>
      </div>
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Loading documents...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No documents found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 p-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
            selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </div>
      </Card>

      {editingDocument && (
        <DocumentEditDialog
          document={editingDocument}
          open={!!editingDocument}
          onOpenChange={(open) => {
            if (!open) setEditingDocument(null)
          }}
          onSave={(updatedDoc) => {
            setDocuments((docs) => docs.map((doc) => (doc.id === updatedDoc.id ? updatedDoc : doc)))
            setEditingDocument(null)
          }}
        />
      )}
    </div>
  )
}
