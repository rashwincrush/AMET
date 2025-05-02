// This script prepares the project for Vercel deployment
// It handles the symlink issues that cause build failures

const fs = require('fs');
const path = require('path');

// Function to copy directory contents recursively
function copyDirSync(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      copyDirSync(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Main function to fix symlinks
function fixSymlinks() {
  console.log('Starting Vercel build preparation...');
  
  // Define paths
  const rootDir = process.cwd();
  const srcDir = path.join(rootDir, 'src');
  
  // Fix components/ui symlink
  const srcComponentsUiDir = path.join(srcDir, 'components/ui');
  const rootComponentsUiDir = path.join(rootDir, 'components/ui');
  
  if (fs.existsSync(srcComponentsUiDir)) {
    console.log('Copying components/ui directory...');
    // Remove existing symlink if it exists
    if (fs.existsSync(rootComponentsUiDir)) {
      if (fs.lstatSync(rootComponentsUiDir).isSymbolicLink()) {
        fs.unlinkSync(rootComponentsUiDir);
      }
    }
    
    // Ensure parent directory exists
    if (!fs.existsSync(path.join(rootDir, 'components'))) {
      fs.mkdirSync(path.join(rootDir, 'components'), { recursive: true });
    }
    
    // Copy directory contents
    copyDirSync(srcComponentsUiDir, rootComponentsUiDir);
  }
  
  // Fix lib symlink
  const srcLibDir = path.join(srcDir, 'lib');
  const rootLibDir = path.join(rootDir, 'lib');
  
  if (fs.existsSync(srcLibDir)) {
    console.log('Copying lib directory...');
    // Remove existing symlink if it exists
    if (fs.existsSync(rootLibDir)) {
      if (fs.lstatSync(rootLibDir).isSymbolicLink()) {
        fs.unlinkSync(rootLibDir);
      }
    }
    
    // Copy directory contents
    copyDirSync(srcLibDir, rootLibDir);
  }
  
  // Fix hooks symlink
  const srcHooksDir = path.join(srcDir, 'hooks');
  const rootHooksDir = path.join(rootDir, 'hooks');
  
  if (fs.existsSync(srcHooksDir)) {
    console.log('Copying hooks directory...');
    // Remove existing symlink if it exists
    if (fs.existsSync(rootHooksDir)) {
      if (fs.lstatSync(rootHooksDir).isSymbolicLink()) {
        fs.unlinkSync(rootHooksDir);
      }
    }
    
    // Copy directory contents
    copyDirSync(srcHooksDir, rootHooksDir);
  }
  
  console.log('Vercel build preparation completed successfully!');
}

// Run the fix
try {
  fixSymlinks();
} catch (error) {
  console.error('Error during build preparation:', error);
  process.exit(1);
}
