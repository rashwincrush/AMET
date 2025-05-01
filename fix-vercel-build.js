/**
 * This script fixes the ENOENT error during Next.js build process when using 'standalone' output
 * Error: ENOENT: no such file or directory, copyfile '.next/server/app/(main)/page_client-reference-manifest.js'
 */

const fs = require('fs');
const path = require('path');

// Function to ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to create an empty file if it doesn't exist
function createEmptyFileIfNotExists(filePath) {
  const dir = path.dirname(filePath);
  ensureDirectoryExists(dir);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Creating empty file: ${filePath}`);
    fs.writeFileSync(filePath, '// Auto-generated empty file to prevent ENOENT errors during build');
    return true;
  }
  return false;
}

// Main function
function fixBuildIssues() {
  console.log('Starting build fix script...');
  
  // List of problematic files that might be missing during build
  const filesToCheck = [
    '.next/server/app/(main)/page_client-reference-manifest.js',
    // Add any other files that might cause similar errors
  ];
  
  let fixesApplied = 0;
  
  // Create empty files for any missing paths
  filesToCheck.forEach(file => {
    if (createEmptyFileIfNotExists(file)) {
      fixesApplied++;
    }
  });
  
  console.log(`Build fix completed. Applied ${fixesApplied} fixes.`);
}

// Run the fix function
fixBuildIssues();
