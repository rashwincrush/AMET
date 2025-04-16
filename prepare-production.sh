#!/bin/bash

# Alumni Management System - Production Preparation Script
# This script prepares the application for production deployment

# Set colors for console output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting production preparation for Alumni Management System...${NC}"

# Step 1: Update install-deps.js to remove SKIP_API_ROUTES check
echo -e "${YELLOW}Fixing install-deps.js...${NC}"
if grep -q "SKIP_API_ROUTES" "install-deps.js"; then
  # Use perl instead of sed for better compatibility
  perl -i -0pe 's/\/\/ Add a hack to disable API routes during build.*?if \(process\.env\.SKIP_API_ROUTES === .true.\) \{.*?console\.log\(.Dependency installation and path setup completed.\);/console.log\("Dependency installation and path setup completed"\);/s' install-deps.js
  echo -e "${GREEN}Removed SKIP_API_ROUTES check from install-deps.js${NC}"
else
  echo -e "${GREEN}No SKIP_API_ROUTES check found in install-deps.js, already fixed.${NC}"
fi

# Step 2: Ensure all API routes have dynamic export
echo -e "${YELLOW}Ensuring all API routes are dynamic...${NC}"
if [ -f "fix-api-routes.sh" ]; then
  bash fix-api-routes.sh
else
  echo -e "${RED}fix-api-routes.sh not found. Creating it...${NC}"
  cat > fix-api-routes.sh << 'EOF'
#!/bin/bash

# This script adds export const dynamic = 'force-dynamic' to all API route.ts files
# to ensure they work correctly with Next.js static site generation

# Set colors for console output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting API route configuration fix...${NC}"

# Find all API route.ts files
API_ROUTES=$(find ./src/app/api -name "route.ts")

# Counter for modified files
MODIFIED=0

for route in $API_ROUTES; do
  echo -e "Processing ${GREEN}$route${NC}"
  
  # Check if dynamic export already exists
  if grep -q "export const dynamic" "$route"; then
    echo -e "${YELLOW}Already has dynamic export, skipping...${NC}"
    continue
  fi
  
  # Add the dynamic export after imports or at the beginning if no imports
  if grep -q "^import" "$route"; then
    # Add after the last import statement
    perl -i -0pe 's/(^import.*$\n)(?!import)/\1\nexport const dynamic = "force-dynamic";\n/m' "$route"
  else
    # Add at the beginning of the file
    perl -i -e 'print "export const dynamic = \"force-dynamic\";\n\n" if $. == 1' "$route"
  fi
  
  echo -e "${GREEN}Modified $route${NC}"
  MODIFIED=$((MODIFIED+1))
done

echo -e "${GREEN}Completed! Modified $MODIFIED API route files${NC}"
EOF
  chmod +x fix-api-routes.sh
  bash fix-api-routes.sh
fi

# Step 3: Update vercel.json
echo -e "${YELLOW}Updating vercel.json...${NC}"
if [ -f "vercel.json" ]; then
  # Remove SKIP_API_ROUTES and set mock data to false
  perl -i -0pe 's/"NEXT_PUBLIC_USE_MOCK_DATA": "true"/"NEXT_PUBLIC_USE_MOCK_DATA": "false"/g' vercel.json
  perl -i -0pe 's/"USE_MOCK_DATA": "true"/"USE_MOCK_DATA": "false"/g' vercel.json
  perl -i -0pe 's/,\s*"SKIP_API_ROUTES": "true"//g' vercel.json
  echo -e "${GREEN}Updated vercel.json${NC}"
else
  echo -e "${RED}vercel.json not found. Creating it...${NC}"
  cat > vercel.json << 'EOF'
{
  "version": 2,
  "buildCommand": "npm run vercel-build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_VERCEL_ENV": "production",
    "NODE_ENV": "production",
    "NEXT_TELEMETRY_DISABLED": "1",
    "NEXT_PUBLIC_USE_MOCK_DATA": "false",
    "USE_MOCK_DATA": "false",
    "NEXT_DISABLE_ESLINT": "1",
    "DISABLE_ESLINT_PLUGIN": "true"
  },
  "build": {
    "env": {
      "NODE_PATH": "src",
      "NEXT_PUBLIC_VERCEL_BUILD": "true",
      "DISABLE_ESLINT_PLUGIN": "true",
      "NEXT_DISABLE_ESLINT": "1"
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" }
      ]
    }
  ]
}
EOF
  echo -e "${GREEN}Created vercel.json${NC}"
fi

# Step 4: Update .env.production
echo -e "${YELLOW}Updating .env.production...${NC}"
if [ -f ".env.production" ]; then
  # Set mock data to false and remove SKIP_API_ROUTES
  perl -i -0pe 's/USE_MOCK_DATA=true/USE_MOCK_DATA=false/g' .env.production
  perl -i -0pe 's/NEXT_PUBLIC_USE_MOCK_DATA=true/NEXT_PUBLIC_USE_MOCK_DATA=false/g' .env.production
  perl -i -0pe 's/SKIP_API_ROUTES=true\s*//g' .env.production
  echo -e "${GREEN}Updated .env.production${NC}"
else
  echo -e "${RED}.env.production not found. Creating it...${NC}"
  cat > .env.production << 'EOF'
# Production Environment Variables
NODE_ENV=production

# Supabase Configuration - Replace with your actual Supabase project details
NEXT_PUBLIC_SUPABASE_URL=https://your-real-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-real-anon-key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# For server-side only (not exposed to the browser)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Disable mock data in production
USE_MOCK_DATA=false
NEXT_PUBLIC_USE_MOCK_DATA=false

# Build configuration
NEXT_DISABLE_ESLINT=1
DISABLE_ESLINT_PLUGIN=true
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_VERCEL_ENV=production
EOF
  echo -e "${GREEN}Created .env.production${NC}"
fi

# Step 5: Update package.json scripts
echo -e "${YELLOW}Updating package.json scripts...${NC}"
if [ -f "package.json" ]; then
  # Remove SKIP_API_ROUTES from vercel-build script
  perl -i -0pe 's/"vercel-build": "npm install tailwindcss postcss autoprefixer @emotion\/is-prop-valid typescript @types\/react @types\/react-dom && node install-deps.js && SKIP_API_ROUTES=true next build"/"vercel-build": "npm install tailwindcss postcss autoprefixer @emotion\/is-prop-valid typescript @types\/react @types\/react-dom && node install-deps.js && next build"/g' package.json
  echo -e "${GREEN}Updated package.json${NC}"
else
  echo -e "${RED}package.json not found. Cannot continue.${NC}"
  exit 1
fi

# Step 6: Make sure src/lib/supabase/server.ts exists
echo -e "${YELLOW}Checking Supabase server client...${NC}"
SUPABASE_SERVER_DIR="src/lib/supabase"
SUPABASE_SERVER_FILE="$SUPABASE_SERVER_DIR/server.ts"

if [ ! -d "$SUPABASE_SERVER_DIR" ]; then
  mkdir -p "$SUPABASE_SERVER_DIR"
  echo -e "${GREEN}Created directory $SUPABASE_SERVER_DIR${NC}"
fi

if [ ! -f "$SUPABASE_SERVER_FILE" ]; then
  echo -e "${RED}$SUPABASE_SERVER_FILE not found. Creating it...${NC}"
  cat > "$SUPABASE_SERVER_FILE" << 'EOF'
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// This function creates a Supabase client for use in Server Components and API routes
export function createClient() {
  const cookieStore = cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or key is missing. Using mock client.');
    return createMockClient();
  }
  
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie setting errors in an edge runtime
            console.error('Error setting cookie:', error);
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
}

// Create a mock client for when environment variables aren't available
function createMockClient() {
  console.warn('Using mock Supabase server client');
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => ({
          order: (column, { ascending = false }) => Promise.resolve({ data: [], error: null }),
          limit: (count) => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
        }),
        limit: (count) => Promise.resolve({ data: [], error: null }),
        order: () => Promise.resolve({ data: [], error: null }),
        filter: () => Promise.resolve({ data: [], error: null }),
        ilike: () => Promise.resolve({ data: [], error: null }),
        gte: () => Promise.resolve({ data: [], error: null }),
        lte: () => Promise.resolve({ data: [], error: null }),
        in: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: (data) => Promise.resolve({ data: null, error: null }),
      update: (data) => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      upsert: (data) => Promise.resolve({ data: null, error: null }),
    }),
    storage: {
      from: (bucket) => ({
        upload: () => Promise.resolve({ data: { path: '' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  };
}

export default createClient;
EOF
  echo -e "${GREEN}Created $SUPABASE_SERVER_FILE${NC}"
else
  echo -e "${GREEN}$SUPABASE_SERVER_FILE already exists${NC}"
fi

# Step 7: Ensure API config module exists
echo -e "${YELLOW}Checking API config module...${NC}"
API_CONFIG_FILE="src/app/api/config.ts"

if [ ! -f "$API_CONFIG_FILE" ]; then
  echo -e "${RED}$API_CONFIG_FILE not found. Creating it...${NC}"
  cat > "$API_CONFIG_FILE" << 'EOF'
/**
 * Centralized configuration for all API routes
 * This ensures consistent settings across our API
 */

// Force dynamic setting to prevent static generation of API routes
export const dynamic = 'force-dynamic';

// Prevent caching of API responses
export const fetchCache = 'force-no-store';

// Set to zero to disable revalidation for API routes
export const revalidate = 0;

// Use nodejs runtime for better compatibility
export const runtime = 'nodejs';
EOF
  echo -e "${GREEN}Created $API_CONFIG_FILE${NC}"
else
  echo -e "${GREEN}$API_CONFIG_FILE already exists${NC}"
fi

echo -e "${GREEN}Production preparation completed successfully!${NC}"
echo -e "${YELLOW}Please review the PRODUCTION_SETUP.md file for detailed instructions on deploying to production.${NC}" 