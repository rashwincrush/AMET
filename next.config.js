/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Enable standalone output for Docker
  poweredByHeader: false, // Remove X-Powered-By header
  images: {
    domains: ['localhost', 'example.com', 'avatars.githubusercontent.com'],
    // Add any additional image domains you need
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false, // Disable source maps in production
  compress: true, // Enable compression
  
  // Configure exporting options for static optimization
  trailingSlash: false,
  
  // Output as static site to avoid SSR issues
  output: process.env.SKIP_API_ROUTES ? 'export' : 'standalone',
};

module.exports = nextConfig;
