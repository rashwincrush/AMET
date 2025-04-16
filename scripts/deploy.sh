#!/bin/bash

# Production deployment script for Alumni Management System
# This script builds and deploys the application to production

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Variables
DEPLOY_TIME=$(date +"%Y-%m-%d %H:%M:%S")
LOG_FILE="deploy-$(date +"%Y%m%d%H%M%S").log"

# Log both to console and file
exec > >(tee -a "$LOG_FILE") 2>&1

echo "📝 Deployment started at $DEPLOY_TIME"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Clean previous build
echo "🧹 Cleaning previous build..."
npm run clean

# Build for production
echo "🏗️ Building for production..."
npm run prod:build

echo "✅ Build successful!"

# Start the production server
echo "🚀 Starting production server..."
npm run prod:start

echo "✅ Deployment completed at $(date +"%Y-%m-%d %H:%M:%S")"
echo "🔗 Your application is now live at: $(grep NEXT_PUBLIC_APP_URL .env.production | cut -d '=' -f2)"

# Optional: Database migrations
# Uncomment if you have database migrations to run
# echo "🗄️ Running database migrations..."
# npm run migrate

# Optional: Copy build to server
# Uncomment and modify if you're copying files to a server
# echo "📂 Copying build to server..."
# rsync -avz --delete .next/ user@server:/path/to/deployment/.next/
# rsync -avz --delete public/ user@server:/path/to/deployment/public/
# scp package.json package-lock.json user@server:/path/to/deployment/

# Optional: Run tests
# echo "🧪 Running tests..."
# npm test

# Optional: Restart server
# echo "🔄 Restarting server..."
# ssh user@server "cd /path/to/deployment && pm2 restart alumni-app"

# Provide instructions for manual server restart if needed
echo "ℹ️ If you need to restart the server manually, run: npm run prod:start" 