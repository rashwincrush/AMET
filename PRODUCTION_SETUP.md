# Alumni Management System - Production Deployment Guide

This guide outlines the steps necessary to make your Alumni Management System fully production-ready, with no mock data, and properly configured for Vercel deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Configuration](#supabase-configuration)
3. [Environment Variables](#environment-variables)
4. [Required Code Changes](#required-code-changes)
5. [Vercel Deployment Configuration](#vercel-deployment-configuration)
6. [Post-Deployment Tasks](#post-deployment-tasks)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

Before proceeding with the production setup, ensure you have:

- A Supabase account with a project created
- A Vercel account for deployment
- Node.js version 18 or higher installed locally
- Basic knowledge of SQL for database setup

## Supabase Configuration

### 1. Database Schema Setup

1. Create your Supabase project at [supabase.com](https://supabase.com)
2. Navigate to the SQL Editor in your Supabase dashboard
3. Import and execute the schema file:
   - Upload `SUPABASE_MIGRATION.sql` or `database/complete_schema.sql`
   - Review the executed queries for any errors

### 2. Authentication Setup

1. In the Supabase dashboard, navigate to Authentication > Settings
2. Configure the following:
   - Site URL: Your production domain (e.g., https://alumni.yourdomain.com)
   - Redirect URLs: Add your production domain plus any paths used for auth redirection
3. Under Authentication > Providers:
   - Configure Email provider settings
   - Set up any OAuth providers if needed (Google, LinkedIn, GitHub)

### 3. Storage Buckets

1. Navigate to Storage in your Supabase dashboard
2. Create the following buckets with appropriate permissions:
   - `avatars` (public)
   - `documents` (private)
   - `event-images` (public)

## Environment Variables

Create these important environment variables in both your local development environment and Vercel deployment:

### Required Variables

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# Deployment Mode
NODE_ENV=production

# Disable Mock Data
USE_MOCK_DATA=false
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Optional Variables

```
# Analytics (if using)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Email Service
EMAIL_SERVICE_API_KEY=your-email-service-key
EMAIL_FROM_ADDRESS=alumni@yourdomain.com
```

## Required Code Changes

To make the system production-ready, make the following code changes:

### 1. Update Vercel Configuration

Edit the `vercel.json` file:

```json
{
  "version": 2,
  "buildCommand": "npm run vercel-build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production",
    "NEXT_TELEMETRY_DISABLED": "1",
    "NEXT_PUBLIC_USE_MOCK_DATA": "false",
    "USE_MOCK_DATA": "false"
  }
}
```

### 2. Fix package.json Scripts

Update your vercel-build script in package.json:

```json
"vercel-build": "npm install tailwindcss postcss autoprefixer @emotion/is-prop-valid typescript @types/react @types/react-dom && node install-deps.js && next build"
```

### 3. Ensure Dynamic API Routes

Run the provided utility script to ensure all API routes are properly configured as dynamic:

```bash
bash fix-api-routes.sh
```

## Vercel Deployment Configuration

Follow these steps to deploy to Vercel:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. In your Vercel dashboard, create a new project and import your repository
3. Configure the build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run vercel-build`
   - Output Directory: `.next`
4. Add all the environment variables listed above
5. Deploy your project

### Important Vercel Settings

1. In project settings > General:
   - Set the correct Node.js version (18.x or higher)
   - Enable "Automatically expose System Environment Variables"

2. In project settings > Functions:
   - Set the maximum execution duration to at least 60 seconds

## Post-Deployment Tasks

After successful deployment, perform these tasks:

1. **Create Initial Admin User**:
   - Sign up as the first user
   - Using Supabase dashboard, execute the SQL to assign admin role:
     ```sql
     INSERT INTO user_roles (profile_id, role_id)
     VALUES ('your-user-id', (SELECT id FROM roles WHERE name = 'admin'));
     ```

2. **Test Authentication Flows**:
   - Registration
   - Login
   - Password recovery
   - Social authentication (if enabled)

3. **Validate Data Models**:
   - Create test entries for events, job listings, and mentorship programs
   - Verify that relationships between entities work correctly

## Monitoring and Maintenance

### Monitoring Setup

1. Set up monitoring for your application:
   - Configure Vercel Analytics
   - Set up error tracking with a service like Sentry

2. Database monitoring:
   - Enable Supabase monitoring alerts
   - Set up periodic database backups

### Regular Maintenance Tasks

1. Supabase:
   - Check database size and performance
   - Review RLS policies for any security issues
   - Monitor auth provider settings and redirects

2. Next.js Application:
   - Keep dependencies updated
   - Monitor API route performance
   - Check for 404 errors or broken links

## Common Issues and Solutions

### API Routes Not Working

If API routes don't work after deployment:

1. Ensure all API route files include:
   ```typescript
   export const dynamic = 'force-dynamic';
   ```

2. Check Vercel logs for specific errors

### Authentication Issues

If authentication is failing:

1. Verify your Supabase URL and keys are correct
2. Check that redirect URLs are properly configured in Supabase
3. Ensure cookies are being handled correctly in production

### Database Access Problems

If the application can't access the database:

1. Confirm that RLS policies are correctly set up
2. Verify that your service role key has necessary permissions
3. Check for IP restrictions in Supabase settings

## Conclusion

By following this guide, your Alumni Management System will be properly configured for production use with Supabase as the backend, running on Vercel's infrastructure. Regular monitoring and maintenance will ensure the system continues to perform well over time.

For any further customizations or troubleshooting, refer to the NextJS and Supabase documentation. 