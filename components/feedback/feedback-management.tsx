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
import { ArrowUpDown, Check, ChevronDown, MoreHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchFeedback, updateFeedbackStatus } from "@/lib/api"
import { FeedbackDetailDialog } from "./feedback-detail-dialog"

export type Feedback = {
  id: string
  documentId: string
  documentTitle: string
  content: string
  correction: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  submittedBy: string
}

export function FeedbackManagement() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("all")

  useEffect(() => {
    const getFeedback = async () => {
      try {
        const data = await fetchFeedback()
        setFeedback(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch feedback:", error)
        setIsLoading(false)
        toast({
          title: "Error",
          description: "Failed to load feedback. Please try again.",
          variant: "destructive",
        })
      }
    }

    getFeedback()
  }, [])

  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    try {
      await updateFeedbackStatus(id, status)
      setFeedback(feedback.map((item) => (item.id === id ? { ...item, status } : item)))
      toast({
        title: `Feedback ${status}`,
        description: `The feedback has been ${status} successfully.`,
      })
    } catch (error) {
      console.error(`Failed to ${status} feedback:`, error)
      toast({
        title: "Error",
        description: `Failed to ${status} feedback. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const filteredFeedback = activeTab === "all" ? feedback : feedback.filter((item) => item.status === activeTab)

  const columns: ColumnDef<Feedback>[] = [
    {
      accessorKey: "documentTitle",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Document
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("documentTitle")}</div>,
    },
    {
      accessorKey: "content",
      header: "Original Content",
      cell: ({ row }) => {
        const content = row.getValue("content") as string
        return <div className="max-w-[300px] truncate">{content}</div>
      },
    },
    {
      accessorKey: "correction",
      header: "Suggested Correction",
      cell: ({ row }) => {
        const correction = row.getValue("correction") as string
        return <div className="max-w-[300px] truncate">{correction}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status === "approved" ? "default" : status === "pending" ? "outline" : "destructive"}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "submittedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="justify-end w-full"
          >
            Submitted
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("submittedAt"))
        return <div className="text-right">{date.toLocaleDateString()}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const feedback = row.original

        return (
          <div className="flex items-center justify-end gap-2">
            {feedback.status === "pending" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleStatusChange(feedback.id, "approved")}
                  className="text-green-500 hover:text-green-700 hover:bg-green-100"
                >
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Approve</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleStatusChange(feedback.id, "rejected")}
                  className="text-red-500 hover:text-red-700 hover:bg-red-100"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Reject</span>
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSelectedFeedback(feedback)}>View details</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(feedback.id)}>
                  Copy feedback ID
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredFeedback,
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

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Filter feedback..."
              value={(table.getColumn("documentTitle")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("documentTitle")?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
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
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          <FeedbackTable table={table} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <FeedbackTable table={table} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="approved" className="mt-4">
          <FeedbackTable table={table} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="rejected" className="mt-4">
          <FeedbackTable table={table} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      {selectedFeedback && (
        <FeedbackDetailDialog
          feedback={selectedFeedback}
          open={!!selectedFeedback}
          onOpenChange={(open) => {
            if (!open) setSelectedFeedback(null)
          }}
          onStatusChange={(status) => {
            handleStatusChange(selectedFeedback.id, status)
            setSelectedFeedback((prev) => (prev ? { ...prev, status } : null))
          }}
        />
      )}
    </div>
  )
}

interface FeedbackTableProps {
  table: any
  isLoading: boolean
}

function FeedbackTable({ table, isLoading }: FeedbackTableProps) {
  return (
    <Card>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => {
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
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading feedback...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: any) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No feedback found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 p-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </Card>
  )
}
