import { type NextRequest, NextResponse } from "next/server"
import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  processDocumentHandler,
  getDocumentChunks,
  getDocumentVectors,
} from "@/lib/api-handlers/documents"
import { MOCK_DOCUMENTS } from "@/lib/mock-data"

export const runtime = "nodejs" // Use Node.js runtime for Supabase

// Main documents endpoint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const type = searchParams.get("type") || "document"

    // Handle different document-related requests
    switch (type) {
      case "chunks":
        if (!id) {
          return NextResponse.json(
            {
              error: "Document ID is required",
              chunks: [],
              status: "error",
            },
            { status: 400 },
          )
        }

        try {
          const { data, error } = await getDocumentChunks(id)

          if (error) {
            console.error(`Error fetching chunks for document ${id}:`, error)
            return NextResponse.json({
              chunks: [],
              error: error.message,
              status: "error",
            })
          }

          return NextResponse.json({
            chunks: data || [],
            status: "success",
          })
        } catch (error) {
          console.error(`Error in chunks request for document ${id}:`, error)
          return NextResponse.json({
            chunks: [],
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          })
        }

      case "vectors":
        if (!id) {
          return NextResponse.json(
            {
              error: "Document ID is required",
              vectors: [],
              status: "error",
            },
            { status: 400 },
          )
        }

        try {
          const { data, error } = await getDocumentVectors(id)

          if (error) {
            console.error(`Error fetching vectors for document ${id}:`, error)
            return NextResponse.json({
              vectors: [],
              error: error.message,
              status: "error",
            })
          }

          return NextResponse.json({
            vectors: data || [],
            status: "success",
          })
        } catch (error) {
          console.error(`Error in vectors request for document ${id}:`, error)
          return NextResponse.json({
            vectors: [],
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          })
        }

      case "document":
      default:
        if (id) {
          try {
            const { data, error } = await getDocumentById(id)

            if (error) {
              console.error(`Error fetching document ${id}:`, error)
              // Return empty document with error
              return NextResponse.json({
                document: null,
                status: "error",
                message: error.message,
              })
            }

            return NextResponse.json({
              document: data,
              status: "success",
            })
          } catch (error) {
            console.error(`Error in document request for ID ${id}:`, error)
            return NextResponse.json({
              document: null,
              status: "error",
              message: error instanceof Error ? error.message : "Unknown error",
            })
          }
        } else {
          try {
            const { data, error } = await getDocuments()

            if (error) {
              console.error("Error fetching documents:", error)
              // Return mock documents instead of error
              return NextResponse.json({
                documents: MOCK_DOCUMENTS,
                status: "error",
                message: error.message,
              })
            }

            return NextResponse.json({
              documents: data || [],
              status: "success",
            })
          } catch (error) {
            console.error("Error in documents request:", error)
            return NextResponse.json({
              documents: MOCK_DOCUMENTS,
              status: "error",
              message: error instanceof Error ? error.message : "Unknown error",
            })
          }
        }
    }
  } catch (error) {
    console.error("Error in GET /api/documents:", error)
    // Always return JSON, even on error
    return NextResponse.json({
      documents: MOCK_DOCUMENTS,
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Create or process a document
export async function POST(req: NextRequest) {
  try {
    // Check if this is a document processing request
    const contentType = req.headers.get("content-type") || ""
    if (contentType.includes("multipart/form-data")) {
      return processDocumentHandler(req)
    }

    // Otherwise, create a new document
    const body = await req.json()
    const { title, content, category, version } = body

    if (!title || !content) {
      return NextResponse.json(
        {
          error: "Title and content are required",
          document: null,
          status: "error",
        },
        { status: 400 },
      )
    }

    const { data, error } = await createDocument({
      title,
      content,
      category: category || "Uncategorized",
      version: version || "1.0",
      status: "pending",
    })

    if (error) {
      console.error("Error creating document:", error)
      return NextResponse.json(
        {
          error: error.message,
          document: null,
          status: "error",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        document: data,
        status: "success",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error in POST /api/documents:", error)
    return NextResponse.json(
      {
        error: "Error creating document",
        document: null,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Update a document
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        {
          error: "Document ID is required",
          document: null,
          status: "error",
        },
        { status: 400 },
      )
    }

    const body = await req.json()
    const { data, error } = await updateDocument(id, body)

    if (error) {
      console.error(`Error updating document ${id}:`, error)
      return NextResponse.json(
        {
          error: error.message,
          document: null,
          status: "error",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      document: data,
      status: "success",
    })
  } catch (error) {
    console.error("Error in PUT /api/documents:", error)
    return NextResponse.json(
      {
        error: "Error updating document",
        document: null,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Delete a document
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        {
          error: "Document ID is required",
          success: false,
          status: "error",
        },
        { status: 400 },
      )
    }

    const { error, success } = await deleteDocument(id)

    if (error) {
      console.error(`Error deleting document ${id}:`, error)
      return NextResponse.json(
        {
          error: error.message,
          success: false,
          status: "error",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success,
      status: "success",
    })
  } catch (error) {
    console.error("Error in DELETE /api/documents:", error)
    return NextResponse.json(
      {
        error: "Error deleting document",
        success: false,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
