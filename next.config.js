/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add redirects configuration
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
      {
        source: '/index',
        destination: '/home',
        permanent: true,
      },
    ];
  },
  reactStrictMode: true,
  swcMinify: true,
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
  
  // Standard Next.js configuration for Vercel deployment
  // Removed standalone output mode to fix build issues
  
  // Disable static generation for problematic routes
  // This ensures these routes are always server-rendered
  unstable_excludeFiles: ['**/index/page.tsx', '**/index/page.js', '**/index.tsx', '**/index.jsx'],
  
  experimental: {
    serverComponentsExternalPackages: ['@supabase/ssr']
  },
  
  // Correctly placed transpilePackages (outside of experimental)
  transpilePackages: ['@supabase/auth-helpers-nextjs']
};

module.exports = nextConfig;
