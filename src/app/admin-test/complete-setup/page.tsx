'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function CompleteSetupPage() {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- Complete setup script for role-based access control

-- Step 1: Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Step 2: Create the roles table
CREATE TABLE roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create the user_roles table
CREATE TABLE user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, role_id)
);

-- Step 4: Create the admin role
INSERT INTO roles (name, description, permissions)
VALUES (
  'admin',
  'System administrator with full access',
  '{
    "manage_users": true,
    "manage_roles": true,
    "manage_events": true,
    "manage_jobs": true,
    "manage_content": true,
    "manage_settings": true
  }'
);

-- Step 5: Assign admin role to your user
INSERT INTO user_roles (profile_id, role_id, assigned_by)
SELECT 
  '5371e2d5-0697-46c0-bf5b-aab2e4d88b58', -- Your user ID
  id,
  '5371e2d5-0697-46c0-bf5b-aab2e4d88b58' -- Your user ID again
FROM roles
WHERE name = 'admin';

-- Step 6: Enable Row Level Security with simple policies
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Step 7: Create basic policies for roles table
CREATE POLICY "Roles are viewable by everyone" 
  ON roles FOR SELECT 
  USING (true);

CREATE POLICY "Roles can be created by admins" 
  ON roles FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.profile_id = auth.uid() AND r.name = 'admin'
  ));

CREATE POLICY "Roles can be updated by admins" 
  ON roles FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.profile_id = auth.uid() AND r.name = 'admin'
  ));

CREATE POLICY "Roles can be deleted by admins" 
  ON roles FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.profile_id = auth.uid() AND r.name = 'admin'
  ));

-- Step 8: Create basic policies for user_roles table
CREATE POLICY "User roles are viewable by everyone" 
  ON user_roles FOR SELECT 
  USING (true);

CREATE POLICY "User roles can be created by admins" 
  ON user_roles FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.profile_id = auth.uid() AND r.name = 'admin'
  ));

CREATE POLICY "User roles can be updated by admins" 
  ON user_roles FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.profile_id = auth.uid() AND r.name = 'admin'
  ));

CREATE POLICY "User roles can be deleted by admins" 
  ON user_roles FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.profile_id = auth.uid() AND r.name = 'admin'
  ));

-- Step 9: Create additional roles (optional)
INSERT INTO roles (name, description, permissions)
VALUES 
  ('event_manager', 'Can create and manage events', '{"manage_events": true}'),
  ('mentor', 'Can mentor other users', '{"mentor_users": true}'),
  ('alumni', 'Basic alumni access', '{"view_network": true, "create_profile": true}'),
  ('student', 'Basic student access', '{"view_jobs": true, "view_events": true}');
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Complete Database Setup</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">Warning</h2>
        <p className="text-yellow-700">
          This script will drop and recreate the roles and user_roles tables. 
          Any existing data in these tables will be lost. Only run this if you want to start fresh.
        </p>
      </div>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          Follow these steps to completely set up your database for role-based access control:
        </p>
        
        <ol className="list-decimal pl-5 space-y-2">
          <li>Copy the SQL script below</li>
          <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Supabase Dashboard</a></li>
          <li>Select your project</li>
          <li>Go to the SQL Editor (in the left sidebar)</li>
          <li>Create a new query</li>
          <li>Paste the SQL script</li>
          <li>Click "Run" to execute the script</li>
          <li>Return to this app and go to <a href="/admin-test" className="text-blue-500 hover:underline">/admin-test</a> to verify the setup</li>
        </ol>
        
        <div className="relative">
          <Button 
            onClick={copyToClipboard}
            className="absolute top-2 right-2 z-10"
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            {sqlScript}
          </pre>
        </div>
      </div>
    </div>
  );
}
