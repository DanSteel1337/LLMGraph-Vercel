/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "via.placeholder.com"],
  },
  experimental: {
    // Remove missingSuspenseWithCSRBailout as it's not recognized in Next.js 15.2.4
  },
  // Remove unstable_excludeFiles as it's not recognized
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      }
    }

    // Optimize chunks
    config.optimization.splitChunks = {
      chunks: "all",
      cacheGroups: {
        default: false,
        vendors: false,
        // Vendor chunk
        vendor: {
          name: "vendor",
          // Only include dependencies in node_modules
          test: /[\\/]node_modules[\\/]/,
          chunks: "all",
          priority: 20,
        },
        // Common chunk
        common: {
          name: "common",
          minChunks: 2,
          chunks: "all",
          priority: 10,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    }

    return config
  },
  // Disable TypeScript type checking during build for speed
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable ESLint during build for speed
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
