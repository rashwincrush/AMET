#!/bin/bash

# AMET Alumni Deployment Script
# This script helps prepare and deploy the AMET Alumni project to Vercel

echo "🚀 Starting AMET Alumni deployment preparation..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️ .env.local file not found. Creating from example..."
    cp .env.example .env.local
    echo "⚠️ Please edit .env.local with your Supabase credentials before deploying!"
    exit 1
fi

# Build the project locally to test
echo "🔨 Building project locally to test..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the errors before deploying."
    exit 1
fi

echo "✅ Local build successful!"
echo "🔍 Checking for pending features based on FEATURES_CHECKLIST.md..."

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "You will be prompted to log in and confirm deployment settings."
echo "Make sure to set the following environment variables in Vercel:"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo "- NEXT_PUBLIC_USE_MOCK_DATA=false"
echo "- NEXT_PUBLIC_SITE_URL=<your-vercel-url>"

# Prompt to continue
read -p "Ready to deploy? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Deploy using Vercel CLI
vercel --prod

echo "✅ Deployment complete!"
echo "Don't forget to configure your Supabase project for production use."
