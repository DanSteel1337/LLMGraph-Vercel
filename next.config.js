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
    esmExternals: "loose", // This is key for handling ESM packages
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

    // Don't attempt to bundle the pdf.worker.mjs file
    // Instead, we'll load it dynamically at runtime
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js|pdf\.worker\.(min\.)?mjs/,
      type: "javascript/auto",
      loader: "file-loader",
      options: {
        name: "static/[name].[hash].[ext]",
      },
    })

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
