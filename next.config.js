/** @type {import('next').NextConfig} */
const nextConfig = {
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
  
  // Set short timeout for static generation to prevent hanging on dynamic routes
  staticPageGenerationTimeout: 30,
  
  // Always use standalone mode for Vercel deployment to support dynamic routes
  output: 'standalone',
  
  // App Router specific optimizations
  compiler: {
    // Enable styled-components and reduce static generation
    styledComponents: true
  },
  
  // Enable external packages for server components
  experimental: {
    // Support SSR with Supabase
    serverComponentsExternalPackages: ['@supabase/ssr'],
    // This helps with SSG issues
    esmExternals: 'loose',
    // Explicitly disable static export
    isrMemoryCacheSize: 0
  },
  
  // Correctly placed transpilePackages (outside of experimental)
  transpilePackages: ['@supabase/auth-helpers-nextjs']
};

module.exports = nextConfig;
