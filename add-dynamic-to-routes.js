const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

const API_DIR = path.join(__dirname, 'src', 'app', 'api');
const DYNAMIC_EXPORT = "\n// Force dynamic to avoid static generation issues\nexport const dynamic = 'force-dynamic';\nexport const runtime = 'nodejs';\n";

async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = path.join(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.flat();
}

async function main() {
  try {
    console.log('Starting to add dynamic exports to API routes...');
    
    const allFiles = await getFiles(API_DIR);
    const routeFiles = allFiles.filter(file => file.endsWith('route.ts'));
    
    console.log(`Found ${routeFiles.length} API route files to process.`);
    
    for (const file of routeFiles) {
      console.log(`Processing: ${file}`);
      
      // Read the file content
      const content = await readFile(file, 'utf8');
      
      // Check if it already has the dynamic export
      if (content.includes("export const dynamic = 'force-dynamic'")) {
        console.log(`  - Already has dynamic export, skipping.`);
        continue;
      }
      
      // Find the position after imports
      const lines = content.split('\n');
      let importEndIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          importEndIndex = i;
        } else if (importEndIndex > 0 && !lines[i].startsWith('import ')) {
          break;
        }
      }
      
      // Insert the dynamic export after imports
      lines.splice(importEndIndex + 1, 0, DYNAMIC_EXPORT);
      const updatedContent = lines.join('\n');
      
      // Write the updated content back to the file
      await writeFile(file, updatedContent);
      console.log(`  - Added dynamic export.`);
    }
    
    console.log('Completed processing all API routes!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 