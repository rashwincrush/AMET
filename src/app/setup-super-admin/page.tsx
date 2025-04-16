'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { ROLES } from '@/lib/roles';

export default function SetupSuperAdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const setupSuperAdmin = async () => {
    if (!user) {
      setError('You must be logged in to set up a super admin account');
      return;
    }

    // Check if the email is provided and matches the expected format
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Check if super_admin role exists, create it if not
      const { data: existingRole, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', ROLES.SUPER_ADMIN)
        .single();

      let superAdminRoleId;

      if (roleError && roleError.code === 'PGRST116') { // No rows returned
        // Create super_admin role
        const { data: newRole, error: createError } = await supabase
          .from('roles')
          .insert({
            name: ROLES.SUPER_ADMIN,
            description: 'Super Administrator with complete access to all features',
            permissions: {
              manage_users: true,
              manage_roles: true,
              manage_events: true,
              manage_jobs: true,
              manage_content: true,
              manage_settings: true,
              view_network: true,
              create_profile: true,
              view_jobs: true,
              view_events: true,
              mentor_users: true,
              create_events: true,
              edit_events: true,
              manage_event_registrations: true,
              create_mentorship: true,
              manage_mentorship: true,
              update_profile: true
            }
          })
          .select('id')
          .single();

        if (createError) throw createError;
        superAdminRoleId = newRole.id;
      } else if (roleError) {
        throw roleError;
      } else {
        superAdminRoleId = existingRole.id;
      }

      // 2. Get the user with the specified email
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) {
        throw new Error(`User with email ${email} not found`);
      }

      // 3. Assign super_admin role to the specified user
      const { error: assignError } = await supabase
        .from('user_roles')
        .insert({
          profile_id: targetUser.id,
          role_id: superAdminRoleId
        });

      if (assignError && assignError.code !== '23505') { // Ignore unique constraint violation
        throw assignError;
      }

      setSuccess(true);
      toast.success('Super Admin role assigned successfully!');
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err: any) {
      console.error('Error setting up super admin:', err);
      setError(err.message || 'Failed to set up super admin account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Super Admin Setup</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            <p>Super Admin role assigned successfully!</p>
            <p className="mt-2">Redirecting to admin dashboard...</p>
          </div>
        ) : (
          <div>
            <p className="mb-6 text-gray-600">
              This page will assign the super admin role to the specified email account.
              Super admins have complete access to all features of the system.
            </p>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the email address of the account you want to make a super admin.
              </p>
            </div>
            
            <button
              onClick={setupSuperAdmin}
              disabled={loading || !user}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Setting up...' : 'Set up Super Admin Access'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
