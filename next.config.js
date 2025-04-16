/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Enable standalone output for Docker
  poweredByHeader: false, // Remove X-Powered-By header
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    // Add any additional image domains you need
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. Only use in production!
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors. Only use in production!
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  productionBrowserSourceMaps: false, // Disable source maps in production
  compress: true, // Enable compression
  
  // Don't attempt to statically optimize API routes or routes that use cookies
  experimental: {
    serverComponentsExternalPackages: ['@supabase/ssr', '@supabase/supabase-js', '@supabase/auth-helpers-nextjs'],
  },
  
  // Configure exporting options for static optimization
  trailingSlash: false,
};

module.exports = nextConfig;
