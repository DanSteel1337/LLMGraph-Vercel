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
import { shouldUseMockData } from "@/lib/environment"

export const runtime = "edge"

// Main documents endpoint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const type = searchParams.get("type") || "document"

    // Check if we should use mock data
    const useMockData = shouldUseMockData()

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

        if (useMockData) {
          return NextResponse.json({
            chunks: [
              {
                id: "chunk-1",
                documentId: id,
                content: "This is a mock document chunk for testing purposes.",
                metadata: { page: 1 },
              },
            ],
            status: "success",
            isMockData: true,
          })
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

          // Ensure we always return an array
          const chunks = Array.isArray(data) ? data : data ? [data] : []

          return NextResponse.json({
            chunks,
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

        if (useMockData) {
          return NextResponse.json({
            vectors: [
              {
                id: "vector-1",
                documentId: id,
                values: Array(10).fill(0.1),
                metadata: { page: 1 },
              },
            ],
            status: "success",
            isMockData: true,
          })
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

          // Ensure we always return an array
          const vectors = Array.isArray(data) ? data : data ? [data] : []

          return NextResponse.json({
            vectors,
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
          if (useMockData) {
            const mockDocument = MOCK_DOCUMENTS.find((doc) => doc.id === id) || {
              id,
              title: "Mock Document",
              description: "This is a mock document for testing purposes",
              category: "Testing",
              version: "1.0",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: "published",
              pageCount: 1,
            }

            return NextResponse.json({
              document: mockDocument,
              status: "success",
              isMockData: true,
            })
          }

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
          if (useMockData) {
            return NextResponse.json({
              documents: MOCK_DOCUMENTS,
              status: "success",
              isMockData: true,
            })
          }

          try {
            const { data, error } = await getDocuments()

            if (error) {
              console.error("Error fetching documents:", error)
              // Return mock documents instead of error
              return NextResponse.json({
                documents: MOCK_DOCUMENTS,
                status: "error",
                message: error.message,
                isMockData: true,
              })
            }

            // Ensure we always return an array
            const documents = Array.isArray(data) ? data : data ? [data] : []

            return NextResponse.json({
              documents,
              status: "success",
            })
          } catch (error) {
            console.error("Error in documents request:", error)
            return NextResponse.json({
              documents: MOCK_DOCUMENTS,
              status: "error",
              message: error instanceof Error ? error.message : "Unknown error",
              isMockData: true,
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
      isMockData: true,
    })
  }
}

// Create or process a document
export async function POST(req: NextRequest) {
  try {
    // Check if we should use mock data
    if (shouldUseMockData()) {
      // For multipart/form-data requests, we can't easily mock the response
      // So we'll just check the content type and return a mock response
      const contentType = req.headers.get("content-type") || ""
      if (contentType.includes("multipart/form-data")) {
        return NextResponse.json({
          document: {
            id: "mock-doc-" + Date.now(),
            title: "Uploaded Document",
            status: "processed",
            created_at: new Date().toISOString(),
          },
          status: "success",
          isMockData: true,
        })
      }

      // For JSON requests, we can parse the body and return a mock response
      const body = await req.json()
      return NextResponse.json(
        {
          document: {
            id: "mock-doc-" + Date.now(),
            ...body,
            status: "pending",
            created_at: new Date().toISOString(),
          },
          status: "success",
          isMockData: true,
        },
        { status: 201 },
      )
    }

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

    // Check if we should use mock data
    if (shouldUseMockData()) {
      const body = await req.json()
      return NextResponse.json({
        document: {
          id,
          ...body,
          updated_at: new Date().toISOString(),
        },
        status: "success",
        isMockData: true,
      })
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

    // Check if we should use mock data
    if (shouldUseMockData()) {
      return NextResponse.json({
        success: true,
        status: "success",
        isMockData: true,
      })
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
