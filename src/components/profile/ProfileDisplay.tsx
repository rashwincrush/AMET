'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import AchievementsList from './AchievementsList';

type ProfileData = {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  graduation_year?: number;
  degree?: string;
  major?: string;
  current_company?: string;
  current_position?: string;
  location?: string;
  bio?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  phone_number?: string;
  current_address?: string;
  permanent_address?: string;
  shipping_address?: string;
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

type ProfileDisplayProps = {
  profile: ProfileData | null;
  achievements: Achievement[];
  onAchievementDeleted: (id: string) => void;
  onAchievementAdded: () => Promise<void>;
  error: string | null;
};

export default function ProfileDisplay({ 
  profile, 
  achievements, 
  onAchievementDeleted, 
  onAchievementAdded,
  error 
}: ProfileDisplayProps) {
  const router = useRouter();

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-100 border border-gray-200 text-gray-900 rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="mt-2 text-gray-600 max-w-2xl">Manage your alumni profile information and showcase your achievements to the community.</p>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {error ? (
            <div className="p-10 text-center">
              <p className="text-red-500">{error}</p>
              <Button 
                onClick={handleEditProfile} 
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Create Profile
              </Button>
            </div>
          ) : !profile || (!profile.first_name && !profile.last_name) ? (
            <div className="p-10 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Not Complete</h3>
              <p className="mt-2 text-sm text-gray-500">Please complete your profile information.</p>
              <Button 
                onClick={handleEditProfile} 
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Complete Profile
              </Button>
            </div>
          ) : (
            <>
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {profile.current_position}{profile.current_company ? ` at ${profile.current_company}` : ''}
                  </p>
                </div>
                <Button 
                  onClick={handleEditProfile} 
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Profile
                </Button>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  {/* Email - Always shown and cannot be edited */}
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.email || 'No email address available'}</dd>
                  </div>
                  
                  {/* Phone Number */}
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.phone_number || 'No phone number available'}</dd>
                  </div>
                  
                  {profile.location && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Current Location</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.location}</dd>
                    </div>
                  )}
                  
                  {/* Current Address */}
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Current Address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">{profile.current_address || 'No current address available'}</dd>
                  </div>
                  
                  {/* Permanent Address */}
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Permanent Address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">{profile.permanent_address || 'No permanent address available'}</dd>
                  </div>
                  
                  {/* Shipping Address */}
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">{profile.shipping_address || 'No shipping address available'}</dd>
                  </div>
                  
                  {/* Education */}
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Education</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile.degree} in {profile.major}, {profile.graduation_year}
                    </dd>
                  </div>
                  
                  {/* Bio */}
                  {profile.bio && (
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Bio</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">{profile.bio}</dd>
                    </div>
                  )}
                  
                  {/* Social Links */}
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Social Links</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <ul className="space-y-2">
                        {profile.linkedin_url && (
                          <li>
                            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              LinkedIn
                            </a>
                          </li>
                        )}
                        {profile.twitter_url && (
                          <li>
                            <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Twitter
                            </a>
                          </li>
                        )}
                        {profile.website_url && (
                          <li>
                            <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Personal Website
                            </a>
                          </li>
                        )}
                        {!profile.linkedin_url && !profile.twitter_url && !profile.website_url && (
                          <li className="text-gray-500">No social links available</li>
                        )}
                      </ul>
                    </dd>
                  </div>
                  
                  {/* Verification Status */}
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Verification Status</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                      {profile.is_verified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending Verification
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </>
          )}
        </div>
        
        {/* Achievements Section */}
        {profile && profile.id && (
          <div className="mt-8">
            <AchievementsList 
              profileId={profile.id} 
              achievements={achievements} 
              onAchievementDeleted={onAchievementDeleted}
              onAchievementAdded={onAchievementAdded}
            />
          </div>
        )}
      </div>
    </div>
  );
}
