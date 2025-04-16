'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import AchievementsList from '@/components/profile/AchievementsList';
import MarineAchievements from '@/components/directory/MarineAchievements';

type ProfileData = {
  id: string;
  first_name?: string;
  last_name?: string;
  graduation_year?: number;
  degree?: string;
  major?: string;
  current_company?: string;
  current_position?: string;
  location?: string;
  industry?: string;
  bio?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  is_verified?: boolean;
  is_mentor?: boolean;
  created_at?: string;
};

type Achievement = {
  id: string;
  title: string;
  description?: string;
  year?: number;
  created_at?: string;
};

function PageClient({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // For future admin functionality

  useEffect(() => {
    async function loadProfile() {
      if (!params.id) return;

      try {
        setLoading(true);
        setError(null);

        // Load profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', params.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        setProfile(profileData);
        setIsOwnProfile(user?.id === params.id);
        
        // Load achievements
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .eq('profile_id', params.id)
          .order('year', { ascending: false });

        if (achievementsError) {
          throw achievementsError;
        }

        setAchievements(achievementsData || []);
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [params.id, user]);

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleVerifyProfile = async () => {
    if (!profile) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !profile.is_verified })
        .eq('id', profile.id);

      if (error) throw error;

      // Update local state
      setProfile(prev => prev ? { ...prev, is_verified: !prev.is_verified } : null);
    } catch (err: any) {
      console.error('Error updating verification status:', err);
      alert('Failed to update verification status');
    }
  };

  const handleAchievementAdded = async () => {
    // Reload achievements after adding a new one
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('profile_id', params.id)
        .order('year', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (err: any) {
      console.error('Error reloading achievements:', err);
    }
  };

  const handleAchievementDeleted = (id: string) => {
    // Update local state after deleting an achievement
    setAchievements(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {loading ? (
            <div className="p-10 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <p className="text-red-500">{error}</p>
              <Link href="/directory">
                <Button 
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Directory
                </Button>
              </Link>
            </div>
          ) : !profile || (!profile.first_name && !profile.last_name) ? (
            <div className="p-10 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Not Complete</h3>
              <p className="mt-2 text-sm text-gray-500">This alumni has not completed their profile yet.</p>
              <Link href="/directory">
                <Button 
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Directory
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div className="flex items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </h3>
                  {profile.is_verified && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Verified
                    </span>
                  )}
                  {profile.is_mentor && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Mentor
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  {isOwnProfile && (
                    <Button 
                      onClick={handleEditProfile} 
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit Profile
                    </Button>
                  )}
                  {(isAdmin || isOwnProfile) && (
                    <Button 
                      onClick={handleVerifyProfile} 
                      variant={profile.is_verified ? "secondary" : "primary"}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm"
                    >
                      {profile.is_verified ? 'Remove Verification' : 'Verify Profile'}
                    </Button>
                  )}
                </div>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  {profile.location && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.location}</dd>
                    </div>
                  )}
                  
                  {profile.industry && (
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Industry</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.industry}</dd>
                    </div>
                  )}
                  
                  {profile.graduation_year && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Education</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {profile.degree}{profile.major ? ` in ${profile.major}` : ''}{profile.graduation_year ? `, Class of ${profile.graduation_year}` : ''}
                      </dd>
                    </div>
                  )}
                  
                  {profile.bio && (
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Bio</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.bio}</dd>
                    </div>
                  )}
                  
                  {/* Display Marine Achievements */}
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Naval Ranks</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <MarineAchievements profileId={profile.id} />
                    </dd>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Social Profiles</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {profile.linkedin_url && (
                          <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                            <div className="w-0 flex-1 flex items-center">
                              <span className="ml-2 flex-1 w-0 truncate">LinkedIn</span>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-500">
                                View
                              </a>
                            </div>
                          </li>
                        )}
                        
                        {profile.twitter_url && (
                          <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                            <div className="w-0 flex-1 flex items-center">
                              <span className="ml-2 flex-1 w-0 truncate">Twitter</span>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-500">
                                View
                              </a>
                            </div>
                          </li>
                        )}
                        
                        {profile.website_url && (
                          <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                            <div className="w-0 flex-1 flex items-center">
                              <span className="ml-2 flex-1 w-0 truncate">Personal Website</span>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-500">
                                View
                              </a>
                            </div>
                          </li>
                        )}
                        
                        {!profile.linkedin_url && !profile.twitter_url && !profile.website_url && (
                          <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                            <div className="w-0 flex-1 flex items-center">
                              <span className="ml-2 flex-1 w-0 truncate">No social profiles added</span>
                            </div>
                          </li>
                        )}
                      </ul>
                    </dd>
                  </div>
                </dl>
              </div>
              
              {/* Achievements Section */}
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <AchievementsList
                  profileId={profile.id}
                  achievements={achievements}
                  isOwnProfile={isOwnProfile}
                  onAchievementAdded={handleAchievementAdded}
                  onAchievementDeleted={handleAchievementDeleted}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfileViewPage({ params }) {
  return <PageClient params={params} />;
}