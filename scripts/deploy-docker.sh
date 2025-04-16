#!/bin/bash

# Docker-based deployment script for Alumni Management System
# This script builds and deploys the application using Docker

# Exit on error
set -e

echo "🚀 Starting Docker deployment process..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed. Please install Docker and try again."
  exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
  echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
  exit 1
fi

# Variables
DEPLOY_TIME=$(date +"%Y-%m-%d %H:%M:%S")
LOG_FILE="docker-deploy-$(date +"%Y%m%d%H%M%S").log"

# Log both to console and file
exec > >(tee -a "$LOG_FILE") 2>&1

echo "📝 Deployment started at $DEPLOY_TIME"

# Create logs directory if it doesn't exist
mkdir -p logs

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo "⚠️ .env.production file not found. Creating one with placeholder values..."
  cp .env.production.example .env.production 2>/dev/null || echo "# Production Environment Variables
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=https://alumni.yourdomain.com" > .env.production
  echo "⚠️ Please update .env.production with your actual values before continuing."
  exit 1
fi

# Build and start the containers
echo "🏗️ Building Docker containers..."
docker-compose -f docker-compose.yml build --no-cache

echo "🚀 Starting Docker containers..."
docker-compose -f docker-compose.yml up -d

# Check if containers are running
echo "✅ Checking container status..."
docker-compose -f docker-compose.yml ps

echo "✅ Deployment completed at $(date +"%Y-%m-%d %H:%M:%S")"
echo "🔗 Your application should be running at: $(grep NEXT_PUBLIC_APP_URL .env.production | cut -d '=' -f2)"
echo "📊 To view logs, run: docker-compose logs -f alumni-app" 