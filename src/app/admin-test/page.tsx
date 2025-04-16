'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AdminTestPage() {
  const [status, setStatus] = useState('Checking database setup...');
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    checkDatabaseSetup();
  }, []);

  const checkDatabaseSetup = async () => {
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      setUserInfo(userData.user);
      console.log('Current user:', userData.user);

      // Check if roles table exists
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('name')
        .limit(1);

      setChecks(prev => ({ ...prev, rolesTable: !rolesError }));
      console.log('Roles table check:', !rolesError, rolesError?.message);

      // Check if admin role exists
      const { data: adminRole, error: adminError } = await supabase
        .from('roles')
        .select('id, name')
        .eq('name', 'admin')
        .single();

      setChecks(prev => ({ ...prev, adminRole: !adminError }));
      console.log('Admin role check:', !adminError, adminRole, adminError?.message);

      // Check if user_roles table exists
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('id')
        .limit(1);

      setChecks(prev => ({ ...prev, userRolesTable: !userRolesError }));
      console.log('User roles table check:', !userRolesError, userRolesError?.message);

      // Check if user has admin role
      if (userData.user?.id && adminRole?.id) {
        const { data: userAdminRole, error: userRoleError } = await supabase
          .from('user_roles')
          .select('id')
          .eq('profile_id', userData.user.id)
          .eq('role_id', adminRole.id)
          .single();

        setChecks(prev => ({ ...prev, userHasAdminRole: !userRoleError }));
        console.log('User admin role check:', !userRoleError, userRoleError?.message);
      }

      setStatus('Database check completed');
    } catch (err: any) {
      console.error('Error checking database:', err);
      setError(err.message || 'Unknown error');
      setStatus('Error checking database');
    }
  };

  const setupAdmin = async () => {
    setStatus('Setting up admin role...');
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error('No user logged in');

      // Create admin role if it doesn't exist
      let adminRoleId;
      const { data: existingRole, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'admin')
        .single();

      if (roleError && roleError.code !== 'PGRST116') {
        console.log('Error checking for admin role:', roleError);
      }

      if (existingRole) {
        adminRoleId = existingRole.id;
        console.log('Using existing admin role:', adminRoleId);
      } else {
        // Create the admin role
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

        if (createError) {
          console.error('Error creating admin role:', createError);
          throw createError;
        }
        
        adminRoleId = newRole.id;
        console.log('Created new admin role:', adminRoleId);
      }

      // Check if user already has admin role
      const { data: existingUserRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('profile_id', userData.user.id)
        .eq('role_id', adminRoleId)
        .single();

      if (!existingUserRole) {
        // Assign admin role to user
        const { error: assignError } = await supabase
          .from('user_roles')
          .insert({
            profile_id: userData.user.id,
            role_id: adminRoleId,
            assigned_by: userData.user.id
          });

        if (assignError) {
          console.error('Error assigning admin role:', assignError);
          throw assignError;
        }
        
        console.log('Admin role assigned successfully');
      } else {
        console.log('User already has admin role');
      }

      setStatus('Admin role setup completed successfully!');
      setChecks(prev => ({ ...prev, userHasAdminRole: true }));
      
      // Refresh the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err: any) {
      console.error('Error setting up admin role:', err);
      setError(err.message || 'Unknown error');
      setStatus('Error setting up admin role');
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Database Setup Check</h1>
      
      {userInfo && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Current User</h2>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>ID:</strong> {userInfo.id}</p>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Current Status</h2>
        <div className="space-y-2">
          <p className={`flex items-center ${checks.rolesTable ? 'text-green-500' : 'text-red-500'}`}>
            <span className="mr-2">u2022</span>
            Roles table exists: {checks.rolesTable ? 'Yes' : 'No'}
          </p>
          <p className={`flex items-center ${checks.adminRole ? 'text-green-500' : 'text-red-500'}`}>
            <span className="mr-2">u2022</span>
            Admin role exists: {checks.adminRole ? 'Yes' : 'No'}
          </p>
          <p className={`flex items-center ${checks.userRolesTable ? 'text-green-500' : 'text-red-500'}`}>
            <span className="mr-2">u2022</span>
            User roles table exists: {checks.userRolesTable ? 'Yes' : 'No'}
          </p>
          <p className={`flex items-center ${checks.userHasAdminRole ? 'text-green-500' : 'text-red-500'}`}>
            <span className="mr-2">u2022</span>
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
  );
}
