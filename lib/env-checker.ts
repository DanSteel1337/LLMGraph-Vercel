export function checkEnvironmentVariables() {
  const variables = {
    supabase: {
      url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY,
      indexName: process.env.PINECONE_INDEX_NAME,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  }

  const missing = []

  if (!variables.supabase.url) missing.push("SUPABASE_URL")
  if (!variables.supabase.key) missing.push("SUPABASE_KEY")
  if (!variables.pinecone.apiKey) missing.push("PINECONE_API_KEY")
  if (!variables.pinecone.indexName) missing.push("PINECONE_INDEX_NAME")
  if (!variables.openai.apiKey) missing.push("OPENAI_API_KEY")

  return {
    variables,
    missing,
    allPresent: missing.length === 0,
  }
}
