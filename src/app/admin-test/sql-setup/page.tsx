'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SqlSetupPage() {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- Step 1: Create the roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create the user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, role_id)
);

-- Step 3: Enable Row Level Security but with a permissive policy for now
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple policies that allow all operations for authenticated users
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON roles;
CREATE POLICY "Allow all operations for authenticated users"
  ON roles
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON user_roles;
CREATE POLICY "Allow all operations for authenticated users"
  ON user_roles
  USING (auth.uid() IS NOT NULL);

-- Step 5: Create the admin role
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
)
ON CONFLICT (name) DO NOTHING
RETURNING id;

-- Step 6: Assign admin role to your user
-- Replace 'YOUR_USER_ID' with your actual user ID
INSERT INTO user_roles (profile_id, role_id, assigned_by)
SELECT 
  '5371e2d5-0697-46c0-bf5b-aab2e4d88b58', -- Your user ID
  id,
  '5371e2d5-0697-46c0-bf5b-aab2e4d88b58' -- Your user ID again
FROM roles
WHERE name = 'admin'
ON CONFLICT (profile_id, role_id) DO NOTHING;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">SQL Setup Instructions</h1>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          Follow these steps to set up your database tables for role-based access control:
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
