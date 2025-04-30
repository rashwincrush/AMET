// Script to fix case-sensitivity issues in component imports
const fs = require('fs');
const path = require('path');

// Directory containing UI components
const componentsDir = path.join(__dirname, 'src', 'components', 'ui');

// Map of lowercase file names to their actual casing
const fileMap = {};

// First, build a map of all component files
const files = fs.readdirSync(componentsDir);
files.forEach(file => {
  if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx')) {
    fileMap[file.toLowerCase()] = file;
  }
});

console.log(`Found ${Object.keys(fileMap).length} component files`);

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Look for import statements with uppercase component names
  const importRegex = /import\s+.*?\s+from\s+['"]\.\/([A-Z][^'"]+)['"]/g;
  let match;
  
  // Store replacements to make
  const replacements = [];
  
  while ((match = importRegex.exec(content)) !== null) {
    const importName = match[1];
    const lowerImportName = importName.toLowerCase();
    
    // Check if we have a lowercase version of this file
    if (fileMap[`${lowerImportName}.tsx`] || fileMap[`${lowerImportName}.js`] || 
        fileMap[`${lowerImportName}.ts`] || fileMap[`${lowerImportName}.jsx`] || 
        fileMap[`${lowerImportName}`]) {
      // Use the actual casing from the filesystem
      const actualFileName = fileMap[`${lowerImportName}.tsx`] || 
                            fileMap[`${lowerImportName}.js`] || 
                            fileMap[`${lowerImportName}.ts`] || 
                            fileMap[`${lowerImportName}.jsx`] ||
                            fileMap[`${lowerImportName}`];
                            
      const actualImportName = actualFileName.replace(/\.[^/.]+$/, ""); // Remove extension
      
      // Only replace if the name actually exists and is different
      if (actualImportName && actualImportName !== importName) {
        replacements.push({
          original: `from './${importName}'`,
          replacement: `from './${actualImportName}'`
        });
      }
    } else {
      // If we don't have the file, use a kebab-case naming convention
      const kebabCase = importName
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase();
      
      // Add to replacements
      replacements.push({
        original: `from './${importName}'`,
        replacement: `from './${kebabCase}'`
      });
      
      // Create re-export file if needed
      const reExportPath = path.join(componentsDir, `${kebabCase}.tsx`);
      if (!fs.existsSync(reExportPath)) {
        console.log(`Creating re-export file: ${kebabCase}.tsx for ${importName}`);
        fs.writeFileSync(
          reExportPath,
          `'use client';\n\n// This is a simple re-export file to provide consistent lowercase naming\nexport * from './${importName}';\n`
        );
      }
    }
  }
  
  // Apply all replacements
  replacements.forEach(({ original, replacement }) => {
    if (content.includes(original)) {
      console.log(`In ${path.basename(filePath)}: Replacing ${original} with ${replacement}`);
      content = content.replace(new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
      changed = true;
    }
  });
  
  // Save the file if changes were made
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

// Process all component files
let changedFiles = 0;
files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  if (fs.statSync(filePath).isFile() && 
     (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx'))) {
    if (fixImportsInFile(filePath)) {
      changedFiles++;
    }
  }
});

console.log(`Fixed imports in ${changedFiles} files`);
