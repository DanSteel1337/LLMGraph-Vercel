# Resolving Node.js Module Issues with Pinecone

## Problem Overview

The Pinecone library relies on Node.js-specific modules (`fs`, `path`, `node:stream`) that aren't available in browser or Edge Runtime environments. This causes build failures when:

1. Using the Pinecone library in Edge Runtime API routes
2. Importing Pinecone-related code in client components
3. Using certain Pinecone features that depend on Node.js modules

## Error Messages

\`\`\`
Failed to compile.
./node_modules/.pnpm/@pinecone-database+pinecone@6.0.0/node_modules/@pinecone-database/pinecone/dist/assistant/data/uploadFile.js:10:1
Module not found: Can't resolve 'fs'
\`\`\`

\`\`\`
Failed to compile.
./node_modules/.pnpm/@pinecone-database+pinecone@6.0.0/node_modules/@pinecone-database/pinecone/dist/assistant/data/uploadFile.js:11:1
Module not found: Can't resolve 'path'
\`\`\`

\`\`\`
Module build failed: UnhandledSchemeError: Reading from "node:stream" is not handled by plugins (Unhandled scheme).
\`\`\`

## Solution Components

Our solution addresses these issues through several coordinated changes:

1. **Updated Next.js Configuration**
   - Added proper module fallbacks for Node.js modules
   - Added Pinecone to `serverComponentsExternalPackages` to handle it correctly in server components
   - Configured webpack to handle Node.js module imports properly

2. **Isolated Pinecone Client Utility**
   - Created a separate utility that only uses Pinecone features that don't rely on problematic Node.js modules
   - Implemented wrapper functions for common Pinecone operations

3. **Dynamic Imports**
   - Used dynamic imports (`import()`) instead of static imports to load Pinecone only in server contexts
   - This prevents the problematic code from being included in client bundles

4. **Runtime Configuration**
   - Set API routes that use Pinecone to use the Node.js runtime instead of Edge Runtime
   - This allows access to Node.js modules when needed

5. **Timeout Handling**
   - Added proper timeout handling for all service checks
   - Prevents hanging requests if a service is unresponsive

## Implementation Examples

### 1. Next.js Configuration

\`\`\`javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        // Other Node.js modules...
      }
    }
    return config
  },
  // Other configuration...
}
\`\`\`

### 2. Dynamic Imports

\`\`\`javascript
// Good practice
async function getPineconeClient() {
  const { Pinecone } = await import("@pinecone-database/pinecone")
  return new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
}

// Avoid this
import { Pinecone } from "@pinecone-database/pinecone" // This can cause issues
\`\`\`

### 3. API Route Configuration

\`\`\`javascript
// app/api/test-pinecone/route.ts
export const runtime = "nodejs" // Use Node.js runtime for Pinecone operations

export async function GET() {
  try {
    const { Pinecone } = await import("@pinecone-database/pinecone")
    // Rest of the code...
  } catch (error) {
    return Response.json({ error: error.message })
  }
}
\`\`\`

## Key Implementation Details

1. **Webpack Fallbacks**
   \`\`\`javascript
   config.resolve.fallback = {
     fs: false,
     path: false,
     // Other Node.js modules...
   }
   \`\`\`
   This tells webpack to provide empty implementations for these modules when bundling for the client.

2. **Dynamic Imports**
   \`\`\`javascript
   const { Pinecone } = await import("@pinecone-database/pinecone")
   \`\`\`
   This loads Pinecone only when the function is called, preventing it from being included in client bundles.

3. **Isolated Pinecone Client**
   \`\`\`javascript
   export function createPineconeClient(apiKey?: string) {
     // Implementation that avoids problematic features
   }
   \`\`\`
   This utility provides a clean API for Pinecone operations without exposing problematic features.

4. **Node.js Runtime for API Routes**
   \`\`\`javascript
   export const runtime = "nodejs"
   \`\`\`
   This ensures that API routes that need Node.js modules run in the Node.js runtime.

## Usage Guidelines

1. **For API Routes**
   - Use `runtime = "nodejs"` for routes that use Pinecone
   - Use dynamic imports for Pinecone and other Node.js-specific modules
   - Use the isolated Pinecone client utility

2. **For Client Components**
   - Never import Pinecone directly
   - Use API routes to interact with Pinecone
   - Handle loading and error states properly

3. **For Server Components**
   - You can use Pinecone directly, but be careful about which features you use
   - Prefer the isolated Pinecone client utility

4. **For Testing**
   - Use the test endpoints to verify service connections
   - Check server logs for detailed error information

## Testing the Solution

You can test if the solution works by accessing:

- [https://www.vector-rag.com/api/test-pinecone](https://www.vector-rag.com/api/test-pinecone)
- [https://www.vector-rag.com/api/health](https://www.vector-rag.com/api/health)

## Additional Resources

- [Next.js Webpack Configuration](https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config)
- [Pinecone Documentation](https://docs.pinecone.io/docs/overview)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

By following these guidelines, you can use Pinecone effectively in a Next.js application without encountering module resolution errors.
