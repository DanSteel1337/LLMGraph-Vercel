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
    appDir: true,
    optimizeCss: false,
    serverComponentsExternalPackages: ["@pinecone-database/pinecone"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
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
