import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use Node.js runtime for consistency
export const runtime = "nodejs"

export async function GET() {
  console.log("Testing Supabase connection...")

  try {
    // Get Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials")
    }

    console.log(`Attempting to connect to Supabase at: ${supabaseUrl}`)

    // Create client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test query
    console.log("Executing test query on documents table...")
    const { data, error } = await supabase.from("documents").select("id").limit(1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: {
        recordCount: data?.length || 0,
        firstRecord: data?.[0] || null,
      },
      message: "Supabase connection successful",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Supabase test failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }, // Return 200 even for errors
    )
  }
}
