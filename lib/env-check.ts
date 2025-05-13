// Environment variable checker utility

export function checkRequiredEnvVars() {
  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "PINECONE_API_KEY",
    "PINECONE_INDEX_NAME",
    "OPENAI_API_KEY",
  ]

  const missingVars = requiredVars.filter((varName) => {
    const value = process.env[varName]
    return !value || value.trim() === ""
  })

  return {
    allPresent: missingVars.length === 0,
    missingVars,
  }
}
