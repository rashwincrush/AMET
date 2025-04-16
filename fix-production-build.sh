#!/bin/bash

# Fix for production builds on CI/CD platforms like Vercel
echo "Fixing production build configuration..."

# Update package.json to include critical dependencies in dependencies section
if ! grep -q "tailwindcss" package.json || ! grep -q "autoprefixer" package.json || ! grep -q "postcss" package.json; then
  echo "Adding missing dependencies to package.json..."
  npm install --save tailwindcss autoprefixer postcss class-variance-authority
fi

# Install critical dependencies just in case
npm install --no-save tailwindcss postcss autoprefixer class-variance-authority framer-motion

# Create required directories
mkdir -p src/components/ui
mkdir -p src/lib
mkdir -p src/hooks

# Run install deps script
node install-deps.js

echo "Production build fixes complete. Run 'npm run build' to build the project."
