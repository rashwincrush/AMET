// Force install framer-motion before build
const { execSync } = require('child_process');

console.log('Installing framer-motion explicitly...');
try {
  execSync('npm install framer-motion@12.7.3 --no-save', { stdio: 'inherit' });
  console.log('Successfully installed framer-motion!');
} catch (error) {
  console.error('Failed to install framer-motion:', error);
  process.exit(1);
} 