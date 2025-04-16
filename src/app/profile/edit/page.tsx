'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProfileForm from '@/components/profile/ProfileForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ArrowLeft, UserCog, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

type ProfileData = {
  id?: string;
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
  profile_picture_url?: string;
  profile_url?: string;
};

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Add a timeout to handle long-running requests
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 10000)
        );

        const fetchPromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // Race between the fetch and the timeout
        const { data, error } = await Promise.race([
          fetchPromise,
          timeoutPromise.then(() => { throw new Error('Request timed out'); })
        ]) as any;

        if (error) {
          throw error;
        }

        // If no profile exists yet, create an empty one with the user's ID
        if (!data) {
          // Create a default profile with user email
          const defaultProfile = {
            id: user.id,
            email: user.email || '',
          };
          
          setProfile(defaultProfile);
        } else {
          setProfile(data);
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
        
        // Create a default profile if there's an error
        if (user) {
          setProfile({
            id: user.id,
            email: user.email || '',
          });
        }
        
        setError('Could not load your profile data. You can still edit and save your profile.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header - More approachable but still clear */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Link 
              href="/profile" 
              className="mr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Back to Profile</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Edit Your Profile</h1>
          </div>
          <p className="text-sm text-gray-600">
            Update your information to stay connected with the alumni community.
          </p>
        </div>

        {loading ? (
          <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your profile information...</p>
          </div>
        ) : error ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Error notification as a banner rather than blocking content */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
            
            {/* Profile form below the warning */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3">
              <div className="flex items-center">
                <UserCog className="h-5 w-5 text-white opacity-80 mr-2" />
                <h2 className="text-base font-medium text-white">Profile Information</h2>
              </div>
            </div>
            <div className="p-6">
              <ProfileForm initialData={profile || {}} isEditing={true} />
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3">
              <div className="flex items-center">
                <UserCog className="h-5 w-5 text-white opacity-80 mr-2" />
                <h2 className="text-base font-medium text-white">Profile Information</h2>
              </div>
            </div>
            <div className="p-6">
              <ProfileForm initialData={profile || {}} isEditing={true} />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}