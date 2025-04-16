'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

type ProfileData = {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  graduation_year?: number;
  degree?: string;
  major?: string;
  current_company?: string;
  current_position?: string;
  is_verified: boolean;
  created_at: string;
};

export default function ProfileVerificationPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (roleError && roleError.code !== 'PGRST116') {
          throw roleError;
        }

        if (!roleData) {
          setIsAdmin(false);
          router.push('/');
          return;
        }

        setIsAdmin(true);
        loadProfiles();
      } catch (err: any) {
        console.error('Error checking admin status:', err);
        setError(err.message || 'Failed to check admin status');
        setLoading(false);
      }
    }

    async function loadProfiles() {
      try {
        setLoading(true);
        setError(null);

        // Load unverified profiles first, then verified ones
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, graduation_year, degree, major, current_company, current_position, is_verified, created_at')
          .order('is_verified', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProfiles(data || []);
      } catch (err: any) {
        console.error('Error loading profiles:', err);
        setError(err.message || 'Failed to load profiles');
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [router]);

  const handleVerify = async (id: string, currentStatus: boolean) => {
    try {
      setProcessingId(id);
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setProfiles(profiles.map(profile => 
        profile.id === id ? { ...profile, is_verified: !currentStatus } : profile
      ));
    } catch (err: any) {
      console.error('Error updating verification status:', err);
      alert('Failed to update verification status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewProfile = (id: string) => {
    router.push(`/profile/${id}`);
  };

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile Verification</h1>
          <p className="mt-2 text-sm text-gray-600">
            Review and verify alumni profiles to ensure authenticity.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profiles...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Education
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Position
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profiles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No profiles found
                      </td>
                    </tr>
                  ) : (
                    profiles.map((profile) => (
                      <tr key={profile.id} className={profile.is_verified ? '' : 'bg-yellow-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {profile.first_name} {profile.last_name}
                              </div>
                              <div className="text-sm text-gray-500">{profile.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {profile.degree}{profile.major ? ` in ${profile.major}` : ''}
                          </div>
                          <div className="text-sm text-gray-500">
                            {profile.graduation_year ? `Class of ${profile.graduation_year}` : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{profile.current_position || 'Not specified'}</div>
                          <div className="text-sm text-gray-500">{profile.current_company || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${profile.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {profile.is_verified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={() => handleViewProfile(profile.id)}
                              variant="outline"
                              className="text-xs py-1 px-2"
                            >
                              View
                            </Button>
                            <Button
                              onClick={() => handleVerify(profile.id, profile.is_verified)}
                              variant={profile.is_verified ? 'destructive' : 'default'}
                              className="text-xs py-1 px-2"
                              disabled={processingId === profile.id}
                            >
                              {processingId === profile.id ? 'Processing...' : profile.is_verified ? 'Unverify' : 'Verify'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}