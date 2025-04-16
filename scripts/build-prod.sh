#!/bin/bash

# Build script for production deployment
echo "🏗️ Building for production deployment to ametalumni.in"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Clean previous build
echo "🧹 Cleaning previous build..."
npm run clean

# Build for production
echo "🏗️ Building for production..."
NODE_ENV=production npm run build

echo "✅ Build completed successfully!"
echo "🚀 Your application is ready to be deployed to http://ametalumni.in" 