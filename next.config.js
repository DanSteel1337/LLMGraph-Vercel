/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // This is important for handling server-only packages
    serverComponentsExternalPackages: ["@pinecone-database/pinecone"],
  },
  webpack: (config, { isServer }) => {
    // Handle Node.js modules properly
    if (!isServer) {
      // Don't resolve these modules on the client to prevent errors
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        "node:stream": false,
        "node:crypto": false,
        "node:fs": false,
        "node:path": false,
        "node:url": false,
        "node:buffer": false,
        "node:util": false,
        "node:assert": false,
        "node:os": false,
        "node:http": false,
        "node:https": false,
        "node:zlib": false,
        "node:events": false,
        "node:net": false,
        "node:tls": false,
      }
    }

    return config
  },
  // Disable image optimization during development to avoid potential issues
  images: {
    unoptimized: true,
  },
  // Disable CSS optimization to avoid critters dependency
  optimizeCss: false,
}

module.exports = nextConfig
