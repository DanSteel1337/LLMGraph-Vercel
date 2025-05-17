/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Updated for Next.js 15 compatibility
    serverActions: true,
  },
  webpack: (config, { isServer }) => {
    // Handle Node.js modules properly
    if (!isServer) {
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

    // Completely exclude PDF.js from server bundle
    if (isServer) {
      const originalEntry = config.entry
      config.entry = async () => {
        const entries = await originalEntry()

        // This prevents PDF.js from being included in the server bundle
        config.externals = [...config.externals, "pdfjs-dist", "canvas", "jsdom"]

        return entries
      }
    }

    return config
  },
  // Disable image optimization during development to avoid potential issues
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
