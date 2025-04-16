// Force install framer-motion before build
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Installing framer-motion explicitly...');
try {
  execSync('npm install framer-motion@12.7.3 --no-save', { stdio: 'inherit' });
  console.log('Successfully installed framer-motion!');
} catch (error) {
  console.error('Failed to install framer-motion:', error);
  process.exit(1);
}

// Make sure path aliases are working
console.log('Setting up proper path aliases for build...');
try {
  // Create a jsconfig.json if it doesn't exist
  if (!fs.existsSync('./jsconfig.json')) {
    console.log('Creating jsconfig.json to help with path resolution...');
    const jsconfigContent = {
      "compilerOptions": {
        "baseUrl": ".",
        "paths": {
          "@/*": ["./src/*"]
        }
      }
    };
    fs.writeFileSync('./jsconfig.json', JSON.stringify(jsconfigContent, null, 2));
  }
  
  // Check that src directory exists
  if (!fs.existsSync('./src')) {
    console.error('src directory missing!');
    process.exit(1);
  }

  // Make sure components directories exist
  const componentsDir = './src/components';
  const uiDir = './src/components/ui';
  
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }
  
  if (!fs.existsSync(uiDir)) {
    fs.mkdirSync(uiDir, { recursive: true });
  }
  
  console.log('Path aliases setup complete!');
} catch (error) {
  console.error('Failed to set up path aliases:', error);
  process.exit(1);
} 