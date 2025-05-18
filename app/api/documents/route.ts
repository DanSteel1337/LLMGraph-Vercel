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
          return NextResponse.json({ error: "Document ID is required", chunks: [] }, { status: 400 })
        }

        try {
          const { data: chunksData, error: chunksError } = await getDocumentChunks(id)

          if (chunksError) {
            console.error(`Error fetching chunks for document ${id}:`, chunksError)
            return NextResponse.json({ chunks: [], error: chunksError.message })
          }

          return NextResponse.json({ chunks: chunksData || [] })
        } catch (error) {
          console.error(`Error in chunks request for document ${id}:`, error)
          return NextResponse.json({
            chunks: [],
            error: "Error fetching document chunks",
          })
        }

      case "vectors":
        if (!id) {
          return NextResponse.json({ error: "Document ID is required", vectors: [] }, { status: 400 })
        }

        try {
          const { data: vectorsData, error: vectorsError } = await getDocumentVectors(id)

          if (vectorsError) {
            console.error(`Error fetching vectors for document ${id}:`, vectorsError)
            return NextResponse.json({ vectors: [], error: vectorsError.message })
          }

          return NextResponse.json({ vectors: vectorsData || [] })
        } catch (error) {
          console.error(`Error in vectors request for document ${id}:`, error)
          return NextResponse.json({
            vectors: [],
            error: "Error fetching document vectors",
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
                error: `Error fetching document: ${error.message}`,
              })
            }

            return NextResponse.json({ document: data })
          } catch (error) {
            console.error(`Error in document request for ID ${id}:`, error)
            return NextResponse.json({
              document: null,
              error: "Error fetching document",
            })
          }
        } else {
          try {
            const { data, error } = await getDocuments()

            if (error) {
              console.error("Error fetching documents:", error)
              // Return mock documents instead of error
              return NextResponse.json({ documents: MOCK_DOCUMENTS })
            }

            return NextResponse.json({ documents: data || [] })
          } catch (error) {
            console.error("Error in documents request:", error)
            return NextResponse.json({
              documents: MOCK_DOCUMENTS,
              error: "Error fetching documents",
            })
          }
        }
    }
  } catch (error) {
    console.error("Error in GET /api/documents:", error)
    // Always return JSON, even on error
    return NextResponse.json({
      documents: MOCK_DOCUMENTS,
      error: "Error processing documents request",
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
      return NextResponse.json({ error: "Title and content are required", document: null }, { status: 400 })
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
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ document: data }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/documents:", error)
    return NextResponse.json(
      {
        error: "Error creating document",
        document: null,
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
      return NextResponse.json({ error: "Document ID is required", document: null }, { status: 400 })
    }

    const body = await req.json()
    const { data, error } = await updateDocument(id, body)

    if (error) {
      console.error(`Error updating document ${id}:`, error)
      return NextResponse.json(
        {
          error: error.message,
          document: null,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ document: data })
  } catch (error) {
    console.error("Error in PUT /api/documents:", error)
    return NextResponse.json(
      {
        error: "Error updating document",
        document: null,
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
      return NextResponse.json({ error: "Document ID is required", success: false }, { status: 400 })
    }

    const { error, success } = await deleteDocument(id)

    if (error) {
      console.error(`Error deleting document ${id}:`, error)
      return NextResponse.json(
        {
          error: error.message,
          success: false,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ success })
  } catch (error) {
    console.error("Error in DELETE /api/documents:", error)
    return NextResponse.json(
      {
        error: "Error deleting document",
        success: false,
      },
      { status: 500 },
    )
  }
}
