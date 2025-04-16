// Script to create an empty build structure
const fs = require('fs');
const path = require('path');

// Create the .next directory if it doesn't exist
const nextDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir, { recursive: true });
}

// Create BUILD_ID
const buildId = new Date().getTime().toString();
fs.writeFileSync(path.join(nextDir, 'BUILD_ID'), buildId);

// Create empty build-manifest.json
const buildManifest = {
  polyfillFiles: [],
  devFiles: [],
  ampDevFiles: [],
  lowPriorityFiles: [],
  rootMainFiles: [],
  pages: {
    '/_app': [],
    '/_error': [],
    '/_document': []
  },
  ampFirstPages: []
};
fs.writeFileSync(
  path.join(nextDir, 'build-manifest.json'),
  JSON.stringify(buildManifest, null, 2)
);

// Create empty prerender-manifest.json
const prerenderManifest = {
  version: 4,
  routes: {},
  dynamicRoutes: {},
  notFoundRoutes: [],
  preview: {
    previewModeId: "previewModeId",
    previewModeSigningKey: "previewModeSigningKey",
    previewModeEncryptionKey: "previewModeEncryptionKey"
  }
};
fs.writeFileSync(
  path.join(nextDir, 'prerender-manifest.json'),
  JSON.stringify(prerenderManifest, null, 2)
);

console.log('Empty build structure created successfully'); 