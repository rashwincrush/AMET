/**
 * Production Build Script for Alumni Management System
 * 
 * This script prepares the application for production deployment on Vercel
 * while preserving the development experience locally.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  // Directories that need to be available at the root level for imports
  criticalDirectories: ['lib', 'components', 'hooks'],
  
  // Files that need to be preserved during build
  preserveFiles: ['.env', '.env.local', '.env.production'],
  
  // TypeScript files to keep (even in production)
  keepTsFiles: ['next-env.d.ts'],
};

// Utility functions
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`Created directory: ${dirPath}`);
  }
}

function copyDirectory(source, destination) {
  ensureDirectoryExists(destination);
  
  try {
    const items = fs.readdirSync(source);
    
    items.forEach(item => {
      const sourcePath = path.join(source, item);
      const destPath = path.join(destination, item);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        copyDirectory(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    });
    
    log(`Copied directory from ${source} to ${destination}`);
  } catch (error) {
    log(`Error copying directory: ${error.message}`);
  }
}

// Main function
async function main() {
  try {
    log('Starting production build preparation...');
    
    // 1. Ensure critical directories exist at root level
    config.criticalDirectories.forEach(dir => {
      const sourceDir = path.join(process.cwd(), 'src', dir);
      const destDir = path.join(process.cwd(), dir);
      
      if (fs.existsSync(sourceDir)) {
        if (!fs.existsSync(destDir)) {
          copyDirectory(sourceDir, destDir);
        } else {
          log(`Directory already exists: ${destDir}`);
        }
      } else {
        log(`Source directory not found: ${sourceDir}`);
      }
    });
    
    // 2. Run the build command
    log('Running Next.js build...');
    execSync('NEXT_DISABLE_ESLINT=1 DISABLE_ESLINT_PLUGIN=true next build', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    log('Production build completed successfully!');
  } catch (error) {
    log(`Error during production build: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
