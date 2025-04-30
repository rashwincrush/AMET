/** @type {import('next').NextConfig} */
const path = require('path');
const fs = require('fs');

// Check if we're in production (Vercel) environment
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

// Ensure lib directory exists in production
if (isProduction && !fs.existsSync(path.resolve('./lib'))) {
  // Create lib directory if it doesn't exist
  if (fs.existsSync(path.resolve('./src/lib'))) {
    console.log('Creating lib directory for production...');
    fs.mkdirSync(path.resolve('./lib'), { recursive: true });
    
    // Create a placeholder file
    fs.writeFileSync(
      path.resolve('./lib/index.js'),
      '// Placeholder file to ensure directory exists\nmodule.exports = {}\n'
    );
  }
}

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
  transpilePackages: ['@supabase/auth-helpers-nextjs'],
  
  // Add webpack configuration to resolve lib paths
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '/lib': path.resolve(__dirname, './src/lib'),
      'lib': path.resolve(__dirname, './src/lib'),
      '/components': path.resolve(__dirname, './src/components'),
      'components': path.resolve(__dirname, './src/components'),
      '/hooks': path.resolve(__dirname, './src/hooks'),
      'hooks': path.resolve(__dirname, './src/hooks')
    };
    return config;
  }
};

module.exports = nextConfig;
