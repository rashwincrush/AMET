'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

type EmployerProfile = {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  company_size: string;
  location: string;
  website: string;
  description: string;
  logo_url?: string;
  is_verified: boolean;
  created_at: string;
  job_count: number;
};

export default function EmployerProfilesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<EmployerProfile[]>([]);
  const [userProfile, setUserProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmployer, setIsEmployer] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    checkEmployerStatus();
    loadEmployerProfiles();
  }, [user]);

  const checkEmployerStatus = async () => {
    if (!user) return;

    try {
      // Check if user has employer role
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'employer')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsEmployer(!!data);
      
      // If user is an employer, check if they have a profile
      if (data) {
        const { data: profileData, error: profileError } = await supabase
          .from('employer_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }
        
        setUserProfile(profileData || null);
      }
    } catch (err: any) {
      console.error('Error checking employer status:', err);
      setError(err.message || 'Failed to check employer status');
    }
  };

  const loadEmployerProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all verified employer profiles with job count
      const { data, error } = await supabase
        .from('employer_profiles')
        .select(`
          *,
          job_listings(count)
        `)
        .eq('is_verified', true)
        .order('company_name');

      if (error) throw error;

      const profilesWithJobCount = data.map((profile: any) => ({
        ...profile,
        job_count: profile.job_listings[0]?.count || 0
      }));

      setProfiles(profilesWithJobCount);
    } catch (err: any) {
      console.error('Error loading employer profiles:', err);
      setError(err.message || 'Failed to load employer profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (id: string) => {
    router.push(`/jobs/employers/${id}`);
  };

  const handleCreateProfile = () => {
    router.push('/jobs/employers/create');
  };

  const handleEditProfile = () => {
    if (userProfile) {
      router.push(`/jobs/employers/edit/${userProfile.id}`);
    }
  };

  const handleRequestEmployerAccess = async () => {
    try {
      if (!user) return;
      
      // Create a request for employer access
      const { error } = await supabase
        .from('employer_access_requests')
        .insert({
          user_id: user.id,
          status: 'pending'
        });
        
      if (error) throw error;
      
      alert('Your request for employer access has been submitted. An administrator will review your request.');
    } catch (err: any) {
      console.error('Error requesting employer access:', err);
      alert('Failed to submit request. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employer Profiles</h1>
            <p className="mt-2 text-sm text-gray-600">
              Connect with companies that are hiring AMET alumni.
            </p>
          </div>
          {isEmployer ? (
            userProfile ? (
              <Button onClick={handleEditProfile}>Edit Your Company Profile</Button>
            ) : (
              <Button onClick={handleCreateProfile}>Create Company Profile</Button>
            )
          ) : (
            <Button onClick={handleRequestEmployerAccess}>Request Employer Access</Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading employer profiles...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">No Employer Profiles</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>There are no verified employer profiles available yet.</p>
              </div>
              {isEmployer && !userProfile && (
                <div className="mt-5">
                  <Button onClick={handleCreateProfile}>Create Your Company Profile</Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <div 
                key={profile.id} 
                className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-300"
                onClick={() => handleViewProfile(profile.id)}
              >
                <div className="p-5">
                  <div className="flex items-center">
                    {profile.logo_url ? (
                      <img 
                        src={profile.logo_url} 
                        alt={`${profile.company_name} logo`} 
                        className="h-12 w-12 object-contain rounded-full bg-gray-100"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        {profile.company_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{profile.company_name}</h3>
                      <p className="text-sm text-gray-500">{profile.industry}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 line-clamp-3">{profile.description}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">{profile.location}</div>
                    <div className="text-sm font-medium text-indigo-600">
                      {profile.job_count} {profile.job_count === 1 ? 'job' : 'jobs'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}