'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function CheckSetupPage() {
  const [status, setStatus] = useState('Checking database setup...');
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkDatabaseSetup();
  }, []);

  const checkDatabaseSetup = async () => {
    try {
      // Check if roles table exists
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('name')
        .limit(1);

      setChecks(prev => ({ ...prev, rolesTable: !rolesError }));

      // Check if admin role exists
      const { data: adminRole, error: adminError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'admin')
        .single();

      setChecks(prev => ({ ...prev, adminRole: !adminError }));

      // Check if user_roles table exists
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('id')
        .limit(1);

      setChecks(prev => ({ ...prev, userRolesTable: !userRolesError }));

      // Check if your user has admin role
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        const { data: userAdminRole, error: userRoleError } = await supabase
          .from('user_roles')
          .select('id')
          .eq('profile_id', userData.user.id)
          .eq('role_id', adminRole?.id)
          .single();

        setChecks(prev => ({ ...prev, userHasAdminRole: !userRoleError }));
      }

      setStatus('Database check completed');
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setStatus('Error checking database');
    }
  };

  const setupAdmin = async () => {
    setStatus('Setting up admin role...');
    try {
      // Create admin role if it doesn't exist
      const { data: adminRole, error: adminError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'admin')
        .single();

      if (adminError && adminError.code !== 'PGRST116') {
        throw adminError;
      }

      let adminRoleId;
      if (!adminRole) {
        const { data: newRole, error: createError } = await supabase
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

        if (createError) throw createError;
        adminRoleId = newRole.id;
      } else {
        adminRoleId = adminRole.id;
      }

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        throw new Error('No user logged in');
      }

      // Assign admin role to user
      const { error: assignError } = await supabase
        .from('user_roles')
        .insert({
          profile_id: userData.user.id,
          role_id: adminRoleId,
          assigned_by: userData.user.id
        });

      if (assignError) throw assignError;

      setStatus('Admin role setup completed successfully!');
      setChecks(prev => ({ ...prev, userHasAdminRole: true }));
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setStatus('Error setting up admin role');
    }
  };

  return (
    <ProtectedRoute allowSetup>
      <div className="container mx-auto p-8 space-y-8">
        <h1 className="text-2xl font-bold">Database Setup Check</h1>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Current Status</h2>
          <div className="space-y-2">
            <p className={`flex items-center ${checks.rolesTable ? 'text-green-500' : 'text-red-500'}`}>
              <span className="mr-2">•</span>
              Roles table exists: {checks.rolesTable ? 'Yes' : 'No'}
            </p>
            <p className={`flex items-center ${checks.adminRole ? 'text-green-500' : 'text-red-500'}`}>
              <span className="mr-2">•</span>
              Admin role exists: {checks.adminRole ? 'Yes' : 'No'}
            </p>
            <p className={`flex items-center ${checks.userRolesTable ? 'text-green-500' : 'text-red-500'}`}>
              <span className="mr-2">•</span>
              User roles table exists: {checks.userRolesTable ? 'Yes' : 'No'}
            </p>
            <p className={`flex items-center ${checks.userHasAdminRole ? 'text-green-500' : 'text-red-500'}`}>
              <span className="mr-2">•</span>
              User has admin role: {checks.userHasAdminRole ? 'Yes' : 'No'}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        <div className="flex justify-center">
          <Button onClick={setupAdmin} disabled={checks.userHasAdminRole}>
            {status === 'Setting up admin role...' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up admin role...
              </>
            ) : (
              'Setup Admin Role'
            )}
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
