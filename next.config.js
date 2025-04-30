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
  
  // Configure exporting options for static optimization
  trailingSlash: false,
  
  // Always use standalone mode for Vercel deployment to support dynamic routes
  output: 'standalone',
  
  // Disable static optimization for root page
  unstable_excludeFiles: ['**/src/app/page.tsx'],
  
  // Enable experimental features to support Supabase SSR
  experimental: {
    serverComponentsExternalPackages: ['@supabase/ssr'],
    // Force runtime for all pages
    runtime: 'nodejs',
    // Allow modifications to routes during build
    transpilePackages: ['@supabase/auth-helpers-nextjs', '@supabase/ssr']
  },
};

module.exports = nextConfig;
