# Supabase Setup Guide for Alumni Management System

This guide provides step-by-step instructions for setting up Supabase for the Alumni Management System, including database schema, authentication, and Role-Based Access Control (RBAC).

## Table of Contents

1. [Initial Supabase Setup](#initial-supabase-setup)
2. [Database Schema Setup](#database-schema-setup)
3. [Authentication Configuration](#authentication-configuration)
4. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
5. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
6. [Database Triggers and Functions](#database-triggers-and-functions)
7. [Testing Your Setup](#testing-your-setup)

## Initial Supabase Setup

### Creating a Supabase Project

1. Sign up or log in to [Supabase](https://supabase.com)
2. Create a new project:
   - Choose a name (e.g., "Alumni Management System")
   - Set a secure database password
   - Select a region closest to your users
   - Choose the free tier or an appropriate paid plan

### Getting API Keys

1. After project creation, go to Project Settings > API
2. Note down the following credentials:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secure, never expose in client code)

### Setting Up Environment Variables

1. Create or update your `.env.local` file in your project root with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema Setup

You can set up your database schema using the SQL Editor in the Supabase Dashboard or using migrations with the Supabase CLI.

### Core Tables

Execute the following SQL statements in the Supabase SQL Editor:

```sql
-- User Profiles Schema
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  avatar_url TEXT,
  graduation_year INT,
  degree TEXT,
  major TEXT,
  current_company TEXT,
  current_position TEXT,
  location TEXT,
  bio TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_mentor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role Management
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, role_id)
);
```

### Additional Tables

Execute the SQL for other tables as needed from your existing schema files:

- Events and event attendees
- Job listings and applications
- Mentorship programs and relationships
- Content pages
- Activity logs
- Notifications

You can find the complete schema in your project's `src/lib/schema.sql` and migration files.

## Authentication Configuration

### Email Authentication Setup

1. Go to Authentication > Providers in the Supabase Dashboard
2. Ensure Email provider is enabled
3. Configure settings:
   - Customize the Site URL to match your production URL
   - Set up redirect URLs (add both development and production URLs)
   - Configure email templates for confirmation, invitation, and password reset

### Social Login (Optional)

1. Go to Authentication > Providers
2. Enable and configure providers you want to use (Google, LinkedIn, etc.)
3. Follow provider-specific instructions to set up OAuth credentials
4. Add the redirect URLs to your OAuth provider settings

### Email Templates

1. Go to Authentication > Email Templates
2. Customize the templates for:
   - Confirmation emails
   - Invitation emails
   - Magic link emails
   - Reset password emails

## Role-Based Access Control (RBAC)

### Setting Up Default Roles

Execute the following SQL to create default roles:

```sql
-- Insert default roles
INSERT INTO roles (name, description, permissions)
VALUES 
  ('admin', 'Administrator with full system access', '{"admin": true, "manage_users": true, "manage_content": true}'),
  ('user', 'Regular user with basic access', '{"view_content": true}'),
  ('alumni', 'Verified alumni with additional access', '{"view_content": true, "alumni_features": true}'),
  ('employer', 'Employer with job posting privileges', '{"view_content": true, "post_jobs": true}')
ON CONFLICT (name) DO NOTHING;
```

### Creating Admin User

After creating your first user, assign them the admin role:

```sql
-- Replace 'YOUR_USER_ID' with the actual UUID of your user
DO $$
DECLARE
  admin_role_id UUID;
  admin_user_id UUID := 'YOUR_USER_ID';
BEGIN
  -- Get the admin role ID
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  
  -- Assign admin role to user
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE profile_id = admin_user_id AND role_id = admin_role_id) THEN
    INSERT INTO user_roles (profile_id, role_id)
    VALUES (admin_user_id, admin_role_id);
  END IF;
END
$$;
```

## Row Level Security (RLS) Policies

### Enable RLS on Tables

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
-- Add similar statements for all other tables
```

### Create RLS Policies

```sql
-- Policies for profiles
-- Users can view any profile
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for roles
-- Only admins can manage roles
CREATE POLICY "Admins can manage roles" ON roles
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      JOIN roles r ON user_roles.role_id = r.id
      WHERE user_roles.profile_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Anyone can view roles
CREATE POLICY "Anyone can view roles" ON roles
  FOR SELECT USING (true);

-- Policies for user_roles
-- Only admins can manage user roles
CREATE POLICY "Admins can manage user roles" ON user_roles
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.profile_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Users can view their own roles
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (profile_id = auth.uid());
```

Add similar policies for all other tables based on your access control requirements.

## Database Triggers and Functions

### Profile Creation Trigger

Create a trigger to automatically create a profile when a new user signs up:

```sql
-- Function to create a profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile after signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Updated At Triggers

Create triggers to automatically update the `updated_at` timestamp:

```sql
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add similar triggers for all other tables with updated_at columns
```

## Testing Your Setup

### Testing Authentication

1. Create a test user through your application's signup flow
2. Verify the user can log in and access protected routes
3. Check that the profile was automatically created

### Testing RBAC

1. Assign different roles to test users
2. Verify that users can only access features appropriate to their role
3. Test admin functionality to ensure admins can manage users and roles

### Testing RLS Policies

1. Use the SQL Editor to run queries as different users
2. Verify that users can only see and modify data according to the RLS policies

## Conclusion

Your Supabase setup for the Alumni Management System is now complete. This configuration provides:

- Secure authentication with email and optional social logins
- Comprehensive database schema for all application features
- Role-based access control for different user types
- Row-level security to protect sensitive data
- Automatic profile creation and timestamp updates

Remember to regularly back up your database and keep your API keys secure.