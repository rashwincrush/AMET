// Custom setup script for Vercel builds
const fs = require('fs');
const path = require('path');

// Function to disable SSG for the root page
function disableStaticGenerationForRootPage() {
  console.log('📝 Patching root page to disable static generation');
  const rootPagePath = path.resolve('./src/app/page.tsx');
  
  try {
    // Read the current content
    let content = fs.readFileSync(rootPagePath, 'utf8');
    
    // Ensure we have the correct exports at the top of the file
    if (!content.includes('export const dynamic = ')) {
      content = `export const dynamic = 'force-dynamic';\nexport const runtime = 'nodejs';\n${content}`;
      fs.writeFileSync(rootPagePath, content, 'utf8');
      console.log('✅ Successfully patched root page to force dynamic rendering');
    } else {
      console.log('ℹ️ Root page already has dynamic export, skipping patch');
    }
    
    // Create a .next/server/app/page.js with explicit SSR config
    // This helps Vercel understand how to handle the route
    console.log('📝 Creating custom server bundle for root page');
    const serverDir = path.resolve('./.next/server/app');
    
    if (!fs.existsSync(serverDir)) {
      fs.mkdirSync(serverDir, { recursive: true });
    }
    
    // Create a simple server component that ensures the page is rendered as dynamic
    const serverContent = `
import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Generate response
export function GET() {
  return NextResponse.redirect(new URL('/home', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'));
}
    `;
    
    fs.writeFileSync(path.resolve(serverDir, 'route.js'), serverContent, 'utf8');
    console.log('✅ Created custom server route for root page');
    
  } catch (error) {
    console.error('❌ Error patching root page:', error);
  }
}

// Main function
async function main() {
  console.log('🔧 Starting Vercel build customization');
  
  // Disable static generation for root page
  disableStaticGenerationForRootPage();
  
  console.log('✅ Vercel build customization completed');
}

// Run the script
main().catch(error => {
  console.error('❌ Error during setup:', error);
  process.exit(1);
});
