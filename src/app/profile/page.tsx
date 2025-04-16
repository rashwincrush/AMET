'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Briefcase, MapPin, Calendar, GraduationCap, Mail, Phone, Globe, Linkedin, Twitter, Edit, Camera, Shield } from 'lucide-react';

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
  is_verified?: boolean;
  created_at?: string;
  avatar_url?: string;
  profile_picture_url?: string;
  is_mentor?: boolean;
  profile_url?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        if (!user?.email) {
          setError('No user email found');
          setLoading(false);
          return;
        }

        // First check if a profile exists with user.id
        const { data: profileDataById, error: profileErrorById } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        // If found by ID, use that profile
        if (profileDataById) {
          setProfile(profileDataById);
          setLoading(false);
          return;
        }

        // Otherwise, try to find by email
        const { data: profileDataByEmail, error: profileErrorByEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();

        if (profileDataByEmail) {
          setProfile(profileDataByEmail);
        } else {
          // No profile found
          console.log('No profile found for user');
          setError('Profile not found. Please create your profile.');
        }
      } catch (err: any) {
        console.error('Error in loadProfile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };
  
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    try {
      if (!user) return;
      
      setUploadingAvatar(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-avatar-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Update the user's profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('id', user.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Refresh the profile data
      const { data: updatedProfileById } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (updatedProfileById) {
        setProfile(updatedProfileById);
      } else {
        // Try by email
        const { data: updatedProfileByEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();
        
        if (updatedProfileByEmail) {
          setProfile(updatedProfileByEmail);
        }
      }
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !profile) {
    return (
      <ProtectedRoute>
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-6">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {error === 'Profile not found. Please create your profile.' ? 'Welcome to the Alumni Network!' : 'Something went wrong'}
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {error === 'Profile not found. Please create your profile.' 
                ? "It looks like you're new here! Create your alumni profile to connect with other alumni and access all features."
                : error || "We couldn't find your profile. You may need to create or complete your profile."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleEditProfile} 
                className="px-6 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm hover:shadow transition-all"
              >
                Create Your Profile
              </Button>
              <Link href="/dashboard">
                <Button 
                  className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium shadow-sm hover:shadow transition-all"
                >
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
          
          {user && (
            <div className="mt-8 bg-white shadow rounded-xl p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Email Address</h3>
                  <p className="text-gray-800">{user.email}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Account Created</h3>
                  <p className="text-gray-800">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        {/* Header with profile summary */}
        <div className="bg-white shadow rounded-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-8 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="relative group">
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full z-10">
                      <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  
                  <div 
                    className="relative cursor-pointer group"
                    onClick={handleAvatarClick}
                  >
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={`${profile.first_name} ${profile.last_name}`}
                        className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-white shadow object-cover transition group-hover:opacity-90"
                      />
                    ) : (
                      <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white border-4 border-white shadow flex items-center justify-center transition group-hover:opacity-90">
                        <span className="text-indigo-600 text-xl font-semibold">
                          {profile.first_name?.[0] || ''}{profile.last_name?.[0] || ''}
                        </span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="bg-black bg-opacity-50 p-2 rounded-full">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    
                    {profile.is_verified && (
                      <div className="absolute -bottom-1 -right-1">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-800 border border-white shadow-sm">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-white">
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  
                  <div className="flex flex-wrap gap-4 mt-2">
                    {profile.current_position && (
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1.5 text-indigo-100" />
                        <span className="text-sm text-indigo-50">
                          {profile.current_position}
                          {profile.current_company && ` at ${profile.current_company}`}
                        </span>
                      </div>
                    )}
                    
                    {profile.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1.5 text-indigo-100" />
                        <span className="text-sm text-indigo-50">{profile.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex mt-3 gap-2">
                    {profile.is_mentor && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                        Mentor
                      </span>
                    )}
                    
                    {profile.is_verified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
                        Verified Alumni
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleEditProfile}
                  className="flex items-center px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg text-sm shadow-sm hover:shadow transition"
                >
                  <Edit className="h-4 w-4 mr-1.5" />
                  Edit Profile
                </Button>
                
                <Link href="/profile/rbac">
                  <Button 
                    className="flex items-center px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg text-sm shadow-sm hover:shadow transition"
                  >
                    <Shield className="h-4 w-4 mr-1.5" />
                    Access Control
                  </Button>
                </Link>

                <Link href="/admin/roles-dashboard">
                  <Button 
                    className="flex items-center px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg text-sm shadow-sm hover:shadow transition"
                  >
                    <Shield className="h-4 w-4 mr-1.5" />
                    Admin Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Profile content */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* Left sidebar */}
            <div className="md:col-span-1 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact & Info</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
                  <ul className="space-y-3">
                    <li className="flex">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-2.5" />
                      <div>
                        <p className="text-sm text-gray-700">{profile.email}</p>
                      </div>
                    </li>
                    
                    {profile.phone_number && (
                      <li className="flex">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-2.5" />
                        <div>
                          <p className="text-sm text-gray-700">{profile.phone_number}</p>
                        </div>
                      </li>
                    )}
                    
                    {profile.location && (
                      <li className="flex">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2.5" />
                        <div>
                          <p className="text-sm text-gray-700">{profile.location}</p>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Social Profiles</h3>
                  <div className="space-y-2">
                    {profile.linkedin_url && (
                      <a 
                        href={profile.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center py-1.5 text-gray-700 hover:text-indigo-600 transition-colors"
                      >
                        <Linkedin className="h-5 w-5 text-gray-500 mr-2.5" />
                        <span className="text-sm">LinkedIn</span>
                      </a>
                    )}
                    
                    {profile.twitter_url && (
                      <a 
                        href={profile.twitter_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center py-1.5 text-gray-700 hover:text-indigo-600 transition-colors"
                      >
                        <Twitter className="h-5 w-5 text-gray-500 mr-2.5" />
                        <span className="text-sm">Twitter</span>
                      </a>
                    )}
                    
                    {profile.website_url && (
                      <a 
                        href={profile.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center py-1.5 text-gray-700 hover:text-indigo-600 transition-colors"
                      >
                        <Globe className="h-5 w-5 text-gray-500 mr-2.5" />
                        <span className="text-sm">Personal Website</span>
                      </a>
                    )}
                    
                    {!profile.linkedin_url && !profile.twitter_url && !profile.website_url && (
                      <p className="text-sm text-gray-500 italic">No social profiles added</p>
                    )}
                  </div>
                </div>
                
                {profile.profile_url && (
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Profile URL</h3>
                    <Link 
                      href={`/profile/${profile.profile_url}`}
                      className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline flex items-center"
                    >
                      <Globe className="h-4 w-4 mr-1.5" />
                      /profile/{profile.profile_url}
                    </Link>
                  </div>
                )}
              </div>
            </div>
            
            {/* Main content */}
            <div className="md:col-span-2 p-6">
              {/* About section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About Me</h2>
                {profile.bio ? (
                  <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">{profile.bio}</p>
                ) : (
                  <p className="text-gray-500 italic text-sm">No bio added yet. Click 'Edit Profile' to add your bio.</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Education section */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <div className="flex items-center mb-4">
                    <div className="bg-indigo-100 p-2 rounded-md mr-3">
                      <GraduationCap className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Education</h2>
                  </div>
                  
                  {(profile.degree || profile.major || profile.graduation_year) ? (
                    <div>
                      {(profile.degree || profile.major) && (
                        <h3 className="text-md font-medium text-gray-800">
                          {profile.degree}{profile.degree && profile.major ? ' in ' : ''}{profile.major}
                        </h3>
                      )}
                      
                      {profile.graduation_year && (
                        <div className="mt-1 flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1.5" />
                          Class of {profile.graduation_year}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">No education information added yet.</p>
                  )}
                </div>
                
                {/* Professional experience section */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <div className="flex items-center mb-4">
                    <div className="bg-indigo-100 p-2 rounded-md mr-3">
                      <Briefcase className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Professional Experience</h2>
                  </div>
                  
                  {(profile.current_position || profile.current_company) ? (
                    <div>
                      {profile.current_position && (
                        <h3 className="text-md font-medium text-gray-800">
                          {profile.current_position}
                        </h3>
                      )}
                      
                      {profile.current_company && (
                        <p className="mt-1 text-sm text-gray-600">{profile.current_company}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">No professional experience added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}