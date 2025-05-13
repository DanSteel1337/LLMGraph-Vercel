import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { deleteDocumentVectors } from "@/lib/ai-sdk"

// Use edge runtime for better serverless compatibility
export const runtime = "nodejs"

// Create a fresh Supabase client for each request
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = getSupabaseClient()

    // Delete document from Supabase
    const { error: supabaseError } = await supabase.from("documents").delete().eq("id", id)

    if (supabaseError) {
      console.error("Error deleting document from Supabase:", supabaseError)
      return NextResponse.json({ error: "Failed to delete document from database" }, { status: 500 })
    }

    // Delete document vectors from Pinecone
    const pineconeSuccess = await deleteDocumentVectors(id)

    if (!pineconeSuccess) {
      // Document was deleted from Supabase but failed to delete from Pinecone
      return NextResponse.json(
        {
          warning: "Document deleted from database but vector deletion failed",
        },
        { status: 207 }, // 207 Multi-Status
      )
    }

    return NextResponse.json({
      message: "Document deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json(
      { error: "Failed to delete document", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await req.json()
    const supabase = getSupabaseClient()

    // Update document in Supabase
    const { data, error } = await supabase.from("documents").update(body).eq("id", id).select().single()

    if (error) {
      console.error("Error updating document:", error)
      return NextResponse.json({ error: "Failed to update document" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Document updated successfully",
      document: data,
    })
  } catch (error) {
    console.error("Error updating document:", error)
    return NextResponse.json(
      { error: "Failed to update document", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
