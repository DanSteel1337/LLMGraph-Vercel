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
          return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
        }

        const { data: chunksData, error: chunksError } = await getDocumentChunks(id)

        if (chunksError) {
          return NextResponse.json(
            {
              error: chunksError instanceof Error ? chunksError.message : String(chunksError),
            },
            { status: 500 },
          )
        }

        return NextResponse.json({ chunks: chunksData })

      case "vectors":
        if (!id) {
          return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
        }

        const { data: vectorsData, error: vectorsError } = await getDocumentVectors(id)

        if (vectorsError) {
          return NextResponse.json(
            {
              error: vectorsError instanceof Error ? vectorsError.message : String(vectorsError),
            },
            { status: 500 },
          )
        }

        return NextResponse.json({ vectors: vectorsData })

      case "document":
      default:
        if (id) {
          const { data, error } = await getDocumentById(id)

          if (error) {
            return NextResponse.json(
              {
                error: error instanceof Error ? error.message : String(error),
              },
              { status: 500 },
            )
          }

          return NextResponse.json({ document: data })
        } else {
          const { data, error } = await getDocuments()

          if (error) {
            return NextResponse.json(
              {
                error: error instanceof Error ? error.message : String(error),
              },
              { status: 500 },
            )
          }

          return NextResponse.json({ documents: data })
        }
    }
  } catch (error) {
    console.error("Error in GET /api/documents:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
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
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const { data, error } = await createDocument({
      title,
      content,
      category: category || "Uncategorized",
      version: version || "1.0",
      status: "pending",
    })

    if (error) {
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ document: data }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/documents:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
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
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    const body = await req.json()
    const { data, error } = await updateDocument(id, body)

    if (error) {
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ document: data })
  } catch (error) {
    console.error("Error in PUT /api/documents:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
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
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    const { error, success } = await deleteDocument(id)

    if (error) {
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ success })
  } catch (error) {
    console.error("Error in DELETE /api/documents:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
