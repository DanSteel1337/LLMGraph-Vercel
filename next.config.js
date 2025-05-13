/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Handle "self is not defined" error
    if (isServer) {
      // When running on the server, some packages might try to access browser-specific globals
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    return config
  },
  // Disable image optimization during development to avoid potential issues
  images: {
    unoptimized: true,
  },
  // Optimize font loading
  optimizeFonts: true,
  // Experimental features
  experimental: {
    // Enable app directory features
    appDir: true,
    optimizeCss: true,
    // Add other experimental features you might have
  },
}

module.exports = nextConfig
