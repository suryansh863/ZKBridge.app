/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@rainbow-me/rainbowkit'],
    webVitalsAttribution: ['CLS', 'LCP'],
    // Enable faster builds and better caching
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable compression
  compress: true,
  // Optimize fonts
  optimizeFonts: true,
  // Improved webpack config for better loading
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting for better loading
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            maxSize: 244000,
          },
          // Separate chunk for heavy libraries
          rainbow: {
            test: /[\\/]node_modules[\\/](@rainbow-me|wagmi)[\\/]/,
            name: 'rainbow',
            priority: 10,
            chunks: 'all',
          },
          // Separate chunk for crypto libraries
          crypto: {
            test: /[\\/]node_modules[\\/](@tanstack|framer-motion)[\\/]/,
            name: 'crypto',
            priority: 10,
            chunks: 'all',
          },
        },
      };
    }
    
    // Improve module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
  // Enable static optimization where possible
  output: 'standalone',
  // Improve loading performance
  poweredByHeader: false,
  generateEtags: false,
};

module.exports = nextConfig;

