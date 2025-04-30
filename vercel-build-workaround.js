// Custom build script to handle static generation exclusion
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to create a simple placeholder root page
function createRootPageWorkaround() {
  console.log('Creating static root page workaround...');
  const appDir = path.resolve('./src/app');
  const pageDir = path.resolve('./pages');
  
  // Create a pages directory if it doesn't exist
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }
  
  // Create a simple index.js file in pages directory that redirects to /home
  // This will use the Pages Router instead of App Router for just the root
  const content = `
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function RedirectHome() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/home');
  }, [router]);
  
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '1rem',
      textAlign: 'center',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        maxWidth: '32rem',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        padding: '2rem',
      }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: 'bold',
          color: '#2563eb',
          marginBottom: '1rem',
        }}>AMET Alumni Portal</h1>
        <p style={{
          color: '#6b7280',
          marginBottom: '1.5rem',
        }}>Welcome to the AMET Alumni Management System</p>
        <a 
          href="/home"
          style={{
            display: 'block',
            width: '100%',
            padding: '0.75rem 1rem',
            backgroundColor: '#2563eb',
            color: 'white',
            textAlign: 'center',
            fontWeight: '500',
            borderRadius: '0.375rem',
            textDecoration: 'none',
          }}
        >
          Enter Alumni Portal
        </a>
        <p style={{
          marginTop: '1rem',
          fontSize: '0.875rem',
          color: '#9ca3af',
        }}>Redirecting to portal...</p>
      </div>
    </div>
  );
}
  `;
  
  fs.writeFileSync(path.resolve(pageDir, 'index.js'), content, 'utf8');
  console.log('Created pages/index.js workaround');
  
  // Temporarily rename the app/page.tsx to make sure it's not used
  if (fs.existsSync(path.resolve(appDir, 'page.tsx'))) {
    fs.renameSync(
      path.resolve(appDir, 'page.tsx'),
      path.resolve(appDir, 'page.tsx.bak')
    );
    console.log('Temporarily renamed app/page.tsx');
  }
}

// Function to run the build with specific environment variables
function runBuild() {
  const appDir = path.resolve('./src/app'); // Define appDir here as well
  console.log('Running Next.js build with workaround...');
  try {
    execSync(
      'DISABLE_ESLINT_PLUGIN=true NEXT_DISABLE_ESLINT=1 NEXT_TYPESCRIPT_COMPILE_ONLY=true NODE_ENV=production next build',
      { stdio: 'inherit' }
    );
    console.log('Build completed successfully');
    
    // Restore the original files after build
    if (fs.existsSync(path.resolve(appDir, 'page.tsx.bak'))) {
      fs.renameSync(
        path.resolve(appDir, 'page.tsx.bak'),
        path.resolve(appDir, 'page.tsx')
      );
      console.log('Restored original app/page.tsx');
    }
    
    return true;
  } catch (error) {
    console.error('Build failed:', error);
    return false;
  }
}

// Main function to execute the build process
async function main() {
  console.log('Starting Vercel build workaround script');
  
  // Create the workaround for the root page
  createRootPageWorkaround();
  
  // Run the build with the workaround in place
  const buildSuccess = runBuild();
  
  if (buildSuccess) {
    console.log('✅ Build completed successfully with workaround');
    process.exit(0);
  } else {
    console.error('❌ Build failed even with workaround');
    process.exit(1);
  }
}

// Execute the script
main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
