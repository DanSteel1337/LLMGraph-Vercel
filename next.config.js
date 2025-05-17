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
    serverComponentsExternalPackages: ["@pinecone-database/pinecone", "pdfjs-dist"],
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

    // Fix for pdfjs-dist worker
    config.resolve.alias = {
      ...config.resolve.alias,
      "pdfjs-dist/build/pdf.worker.js": "pdfjs-dist/build/pdf.worker.mjs",
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
