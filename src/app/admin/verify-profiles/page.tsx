'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

type AlumniProfile = {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  graduation_year?: number;
  degree?: string;
  major?: string;
  current_company?: string;
  current_position?: string;
  is_verified: boolean;
  created_at: string;
};

export default function VerifyProfilesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'all' | 'verified' | 'unverified'>('unverified');
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  
  useEffect(() => {
    async function checkAdminStatus() {
      try {
        if (!user) return;
        
        // Check if user has admin role
        const { data, error } = await supabase
          .from('user_roles')
          .select('roles!inner(name)')
          .eq('profile_id', user.id)
          .eq('roles.name', 'admin')
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
          throw error;
        }

        if (!data) {
          setIsAdmin(false);
          router.push('/');
          return;
        }

        setIsAdmin(true);
        await loadProfiles();
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to verify permissions. Please try again.');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }
    
    checkAdminStatus();
  }, [user, router]);
  
  // Define loadProfiles function outside useEffect for reuse
  async function loadProfiles() {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, email, graduation_year, degree, major, current_company, current_position, is_verified, created_at')
        .order('created_at', { ascending: false });
        
      if (verificationStatus === 'verified') {
        query = query.eq('is_verified', true);
      } else if (verificationStatus === 'unverified') {
        query = query.eq('is_verified', false);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setProfiles(data || []);
    } catch (err: any) {
      console.error('Error loading profiles:', err);
      setError(err.message || 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }

  // Reload profiles when verification status changes
  useEffect(() => {
    if (isAdmin) {
      loadProfiles();
    }
  }, [verificationStatus, isAdmin]);

  const handleVerify = async (profileId: string) => {
    try {
      if (!user || !isAdmin) return;
      
      setProcessingIds(prev => [...prev, profileId]);
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', profileId);
        
      if (error) throw error;
      
      // Update local state
      setProfiles(profiles.map(profile => 
        profile.id === profileId ? { ...profile, is_verified: true } : profile
      ));
      
      // In a real implementation, we would also send an email notification to the user
    } catch (err: any) {
      console.error('Error verifying profile:', err);
      alert('Failed to verify profile. Please try again.');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== profileId));
    }
  };
  
  const handleUnverify = async (profileId: string) => {
    try {
      if (!user || !isAdmin) return;
      
      setProcessingIds(prev => [...prev, profileId]);
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: false })
        .eq('id', profileId);
        
      if (error) throw error;
      
      // Update local state
      setProfiles(profiles.map(profile => 
        profile.id === profileId ? { ...profile, is_verified: false } : profile
      ));
    } catch (err: any) {
      console.error('Error unverifying profile:', err);
      alert('Failed to unverify profile. Please try again.');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== profileId));
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.toLowerCase();
    const email = profile.email?.toLowerCase() || '';
    
    return searchTerm === '' || 
      fullName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>You do not have permission to access this page.</p>
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Return to Home
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verify Alumni Profiles</h1>
          <p className="mt-2 text-sm text-gray-500">Review and verify alumni profiles to ensure authenticity.</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email"
              className="w-full p-3 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full p-3 border rounded-md"
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value as 'all' | 'verified' | 'unverified')}
            >
              <option value="all">All Profiles</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No profiles found matching your criteria.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredProfiles.map((profile) => (
                <li key={profile.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="ml-3">
                          <p className="text-lg font-medium text-gray-900">
                            {profile.first_name} {profile.last_name}
                            {profile.is_verified && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">{profile.email}</p>
                        </div>
                      </div>
                      <div>
                        {profile.is_verified ? (
                          <Button
                            onClick={() => handleUnverify(profile.id)}
                            disabled={processingIds.includes(profile.id)}
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            {processingIds.includes(profile.id) ? 'Processing...' : 'Unverify'}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleVerify(profile.id)}
                            disabled={processingIds.includes(profile.id)}
                            className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                          >
                            {processingIds.includes(profile.id) ? 'Processing...' : 'Verify'}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {profile.graduation_year && (
                            <span className="mr-4">
                              <span className="font-medium text-gray-700">Year:</span> {profile.graduation_year}
                            </span>
                          )}
                          {profile.degree && (
                            <span className="mr-4">
                              <span className="font-medium text-gray-700">Degree:</span> {profile.degree}
                            </span>
                          )}
                          {profile.major && (
                            <span>
                              <span className="font-medium text-gray-700">Major:</span> {profile.major}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          <span className="font-medium text-gray-700">Joined:</span> {formatDate(profile.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {profile.current_position && profile.current_company && (
                          <span>
                            <span className="font-medium text-gray-700">Current:</span> {profile.current_position} at {profile.current_company}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="mt-2">
                      <Link 
                        href={`/profile/${profile.id}`} 
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Full Profile
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}