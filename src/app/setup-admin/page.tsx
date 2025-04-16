'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export default function SetupAdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const setupAdmin = async () => {
    if (!user) {
      setError('You must be logged in to set up an admin account');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Check if admin role exists, create it if not
      const { data: existingRole, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'administrator')
        .single();

      let adminRoleId;

      if (roleError && roleError.code === 'PGRST116') { // No rows returned
        // Create admin role
        const { data: newRole, error: createError } = await supabase
          .from('roles')
          .insert({
            name: 'administrator',
            description: 'Administrator with full access',
            permissions: {
              manage_users: true,
              manage_roles: true,
              manage_content: true,
              manage_settings: true
            }
          })
          .select('id')
          .single();

        if (createError) throw createError;
        adminRoleId = newRole.id;
      } else if (roleError) {
        throw roleError;
      } else {
        adminRoleId = existingRole.id;
      }

      // 2. Assign admin role to current user
      const { error: assignError } = await supabase
        .from('user_roles')
        .insert({
          profile_id: user.id,
          role_id: adminRoleId
        });

      if (assignError && assignError.code !== '23505') { // Ignore unique constraint violation
        throw assignError;
      }

      setSuccess(true);
      toast.success('Admin role assigned successfully!');
      setTimeout(() => {
        router.push('/admin/roles-dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error setting up admin:', err);
      setError(err.message || 'Failed to set up admin account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Setup</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            <p>Admin role assigned successfully!</p>
            <p className="mt-2">Redirecting to admin dashboard...</p>
          </div>
        ) : (
          <div>
            <p className="mb-6 text-gray-600">
              This page will assign the admin role to your current user account ({user?.email}).
              Click the button below to proceed.
            </p>
            
            <button
              onClick={setupAdmin}
              disabled={loading || !user}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Setting up...' : 'Set up Admin Access'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
