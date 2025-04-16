'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function SetupTablesPage() {
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);

  const createRolesTable = async () => {
    setStatus('Creating roles table...');
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS roles (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            permissions JSONB NOT NULL DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

      if (error) throw error;
      setResults(prev => [...prev, 'Roles table created successfully']);
      return true;
    } catch (err: any) {
      setResults(prev => [...prev, `Error creating roles table: ${err.message}`]);
      console.error('Error creating roles table:', err);
      return false;
    }
  };

  const createUserRolesTable = async () => {
    setStatus('Creating user_roles table...');
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS user_roles (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
            assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(profile_id, role_id)
          );
        `
      });

      if (error) throw error;
      setResults(prev => [...prev, 'User roles table created successfully']);
      return true;
    } catch (err: any) {
      setResults(prev => [...prev, `Error creating user_roles table: ${err.message}`]);
      console.error('Error creating user_roles table:', err);
      return false;
    }
  };

  const createAdminRole = async () => {
    setStatus('Creating admin role...');
    try {
      const { data, error } = await supabase
        .from('roles')
        .insert({
          name: 'admin',
          description: 'System administrator with full access',
          permissions: {
            manage_users: true,
            manage_roles: true,
            manage_events: true,
            manage_jobs: true,
            manage_content: true,
            manage_settings: true
          }
        })
        .select()
        .single();

      if (error) throw error;
      setResults(prev => [...prev, `Admin role created with ID: ${data.id}`]);
      return data.id;
    } catch (err: any) {
      setResults(prev => [...prev, `Error creating admin role: ${err.message}`]);
      console.error('Error creating admin role:', err);
      return null;
    }
  };

  const assignAdminRole = async (roleId: string) => {
    setStatus('Assigning admin role to user...');
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('user_roles')
        .insert({
          profile_id: userData.user.id,
          role_id: roleId,
          assigned_by: userData.user.id
        });

      if (error) throw error;
      setResults(prev => [...prev, 'Admin role assigned to user successfully']);
      return true;
    } catch (err: any) {
      setResults(prev => [...prev, `Error assigning admin role: ${err.message}`]);
      console.error('Error assigning admin role:', err);
      return false;
    }
  };

  const setupTables = async () => {
    setStatus('Setting up database tables...');
    setResults([]);
    setError(null);
    
    try {
      // Create roles table
      const rolesCreated = await createRolesTable();
      if (!rolesCreated) {
        setError('Failed to create roles table');
        return;
      }
      
      // Create user_roles table
      const userRolesCreated = await createUserRolesTable();
      if (!userRolesCreated) {
        setError('Failed to create user_roles table');
        return;
      }
      
      // Create admin role
      const adminRoleId = await createAdminRole();
      if (!adminRoleId) {
        setError('Failed to create admin role');
        return;
      }
      
      // Assign admin role to user
      const roleAssigned = await assignAdminRole(adminRoleId);
      if (!roleAssigned) {
        setError('Failed to assign admin role');
        return;
      }
      
      setStatus('Database setup completed successfully!');
      
      // Redirect to admin test page after 2 seconds
      setTimeout(() => {
        window.location.href = '/admin-test';
      }, 2000);
      
    } catch (err: any) {
      console.error('Error setting up database:', err);
      setError(err.message || 'Unknown error');
      setStatus('Error setting up database');
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Database Setup</h1>
      <p className="text-gray-600">
        This page will create the necessary tables in your Supabase database for role-based access control.
      </p>
      
      <div className="flex justify-center">
        <Button onClick={setupTables}>
          {status.includes('Setting up') ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {status}
            </>
          ) : (
            'Setup Database Tables'
          )}
        </Button>
      </div>
      
      {results.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <ul className="space-y-1">
            {results.map((result, index) => (
              <li key={index} className={result.includes('Error') ? 'text-red-500' : 'text-green-500'}>
                {result}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}
    </div>
  );
}
