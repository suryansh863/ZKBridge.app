/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
  // Suppress extension-related warnings and errors
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Suppress extension-related console messages in development
      config.plugins.push(
        new (require('webpack')).DefinePlugin({
          'process.env.SUPPRESS_EXTENSION_ERRORS': JSON.stringify('true'),
        })
      );
    }
    return config;
  },
  // Add headers to help with extension communication
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

