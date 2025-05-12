/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: "standalone",
  serverExternalPackages: ["sharp"], // Updated from experimental.serverComponentsExternalPackages

  // Fix the webpack configuration to avoid null reference errors
  webpack: (config, { isServer }) => {
    // Optimize client-side chunks
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20000,
        maxSize: 70000,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: "framework",
            test: /[\\/]node_modules[\\/](@react|react|react-dom|next|scheduler)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Fix: Safely extract the package name with null checks
              const packageNameMatch =
                module.context && module.context.match
                  ? module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)
                  : null

              return packageNameMatch && packageNameMatch[1]
                ? `npm.${packageNameMatch[1].replace("@", "")}`
                : "npm.unknown"
            },
            priority: 30,
          },
        },
      }
    }

    return config
  },
}

module.exports = nextConfig
