/**
 * This script handles dependency installation and path setup for Vercel deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting dependency installation and path setup...');

// Install critical dependencies
console.log('Installing critical dependencies...');
try {
  execSync('npm install --no-save @supabase/supabase-js', { stdio: 'inherit' });
  console.log('Successfully installed critical dependencies');
} catch (error) {
  console.error('Failed to install critical dependencies:', error);
  process.exit(1);
}

// Create environment variables file
console.log('Setting up production build environment...');
const envContent = `
NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url'}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key'}
`;

fs.writeFileSync('.env.local', envContent);
console.log('Created .env.local file with environment values');

// Create necessary symlinks for component libraries
const componentDirs = ['ui', 'lib', 'hooks'];

// Create components directory if it doesn't exist
if (!fs.existsSync('./components')) {
  fs.mkdirSync('./components', { recursive: true });
  console.log('Created directory: ./components');
}

// Create symlinks for each component directory
componentDirs.forEach(dir => {
  const sourceDir = `./src/${dir}`;
  const targetDir = `./${dir}`;
  
  // If the target is a directory and not a symlink, don't override it
  if (fs.existsSync(targetDir) && !fs.lstatSync(targetDir).isSymbolicLink()) {
    console.log(`Directory already exists: ${targetDir}, skipping symlink`);
    return;
  }
  
  // Create ui directory inside components
  if (dir === 'ui') {
    if (!fs.existsSync('./components/ui')) {
      try {
        fs.symlinkSync(path.resolve(`./src/components/${dir}`), `./components/${dir}`, 'dir');
        console.log(`Created symlink from ./src/components/${dir} to ./components/${dir}`);
      } catch (error) {
        console.error(`Failed to create symlink for ${dir}:`, error);
      }
    }
  }

  // Create symlinks for other directories
  try {
    if (fs.existsSync(sourceDir)) {
      fs.symlinkSync(path.resolve(sourceDir), targetDir, 'dir');
      console.log(`Created symlink from ${sourceDir} to ${targetDir}`);
    }
  } catch (error) {
    console.error(`Failed to create symlink for ${dir}:`, error);
  }
});

console.log('Dependency installation and path setup completed');
