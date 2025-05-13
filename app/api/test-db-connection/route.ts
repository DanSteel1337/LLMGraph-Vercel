import { NextResponse } from "next/server"
import { getApiSupabaseClient } from "@/lib/supabase/api-client"

export async function GET() {
  const results = {
    connectionTest: {
      success: false,
      message: "",
      error: null as any,
    },
    environmentVariables: {
      supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing",
      supabaseKey:
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing",
    },
    tablesTest: {
      documents: { exists: false, error: null as any },
      profiles: { exists: false, error: null as any },
      search_history: { exists: false, error: null as any },
    },
  }

  try {
    const supabase = getApiSupabaseClient()

    // Test basic connection
    const { data, error } = await supabase.from("documents").select("id").limit(1)

    if (error) {
      results.connectionTest.success = false
      results.connectionTest.message = "Failed to connect to database"
      results.connectionTest.error = error.message
    } else {
      results.connectionTest.success = true
      results.connectionTest.message = "Successfully connected to database"
    }

    // Test each table
    for (const table of ["documents", "profiles", "search_history"] as const) {
      try {
        const { error } = await supabase.from(table).select("id").limit(1)
        results.tablesTest[table].exists = !error
        if (error) {
          results.tablesTest[table].error = error.message
        }
      } catch (err) {
        results.tablesTest[table].error = err instanceof Error ? err.message : String(err)
      }
    }
  } catch (error) {
    results.connectionTest.success = false
    results.connectionTest.message = "Exception during connection test"
    results.connectionTest.error = error instanceof Error ? error.message : String(error)
  }

  return NextResponse.json(results)
}
