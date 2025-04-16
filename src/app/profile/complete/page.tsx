'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    degree: '',
    major: '',
    current_company: '',
    current_position: '',
    location: '',
    bio: '',
    linkedin_url: '',
    twitter_url: '',
    website_url: '',
    is_mentor: false,
    mentor_topics: '',
    avatar_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  useEffect(() => {
    // Check if user already has a complete profile
    async function checkProfile() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        // If profile has most fields filled, redirect to profile page
        if (data && data.degree && data.major && data.current_position) {
          router.push('/profile');
        } else if (data) {
          // Pre-fill form with existing data
          setFormData(prevData => ({
            ...prevData,
            ...Object.fromEntries(
              Object.entries(data).filter(([key, value]) => 
                value !== null && 
                key in prevData
              )
            )
          }));
        }
      } catch (err) {
        console.error('Error checking profile:', err);
      }
    }
    
    checkProfile();
  }, [user, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    if (!user) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;
    
    try {
      setUploadingImage(true);
      
      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      if (data) {
        setFormData(prevData => ({
          ...prevData,
          avatar_url: data.publicUrl
        }));
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload profile image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      setSuccess(true);
      
      // Redirect to profile page after a delay
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Complete Your Profile</h3>
              <p className="mt-1 text-sm text-gray-600">
                This information will be displayed publicly so be careful what you share.
              </p>
            </div>
          </div>
          
          <div className="mt-5 md:mt-0 md:col-span-2">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-green-700">Profile updated successfully! Redirecting...</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Education */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Education</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Your academic background information.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
                        Degree
                      </label>
                      <select
                        id="degree"
                        name="degree"
                        value={formData.degree}
                        onChange={handleChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Select a degree</option>
                        <option value="Bachelor's">Bachelor's</option>
                        <option value="Master's">Master's</option>
                        <option value="PhD">PhD</option>
                        <option value="Associate">Associate</option>
                        <option value="Certificate">Certificate</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                        Major/Field of Study
                      </label>
                      <input
                        type="text"
                        name="major"
                        id="major"
                        value={formData.major}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Professional Information */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Professional Information</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Your current professional details.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="current_position" className="block text-sm font-medium text-gray-700">
                        Current Position
                      </label>
                      <input
                        type="text"
                        name="current_position"
                        id="current_position"
                        value={formData.current_position}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="current_company" className="block text-sm font-medium text-gray-700">
                        Current Company/Organization
                      </label>
                      <input
                        type="text"
                        name="current_company"
                        id="current_company"
                        value={formData.current_company}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="City, State, Country"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Profile Details */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Details</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Additional information about yourself.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Tell us about yourself"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Brief description for your profile. URLs are hyperlinked.
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Profile Photo
                    </label>
                    <div className="mt-1 flex items-center">
                      {formData.avatar_url ? (
                        <img 
                          src={formData.avatar_url} 
                          alt="Profile" 
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <span className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                          <svg className="h-10 w-10 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </span>
                      )}
                      <div className="ml-5">
                        <input
                          type="file"
                          id="profile_image"
                          name="profile_image"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="sr-only"
                        />
                        <label
                          htmlFor="profile_image"
                          className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                        >
                          {uploadingImage ? 'Uploading...' : 'Change'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Social Links</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Connect with other alumni on social platforms.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700">
                        LinkedIn URL
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          linkedin.com/in/
                        </span>
                        <input
                          type="text"
                          name="linkedin_url"
                          id="linkedin_url"
                          value={formData.linkedin_url}
                          onChange={handleChange}
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                          placeholder="username"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="twitter_url" className="block text-sm font-medium text-gray-700">
                        Twitter URL
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          twitter.com/
                        </span>
                        <input
                          type="text"
                          name="twitter_url"
                          id="twitter_url"
                          value={formData.twitter_url}
                          onChange={handleChange}
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                          placeholder="username"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">
                        Personal Website
                      </label>
                      <input
                        type="url"
                        name="website_url"
                        id="website_url"
                        value={formData.website_url}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mentorship */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Mentorship</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Would you like to mentor other alumni?
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="is_mentor"
                        name="is_mentor"
                        type="checkbox"
                        checked={formData.is_mentor}
                        onChange={(e) => setFormData({...formData, is_mentor: e.target.checked})}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="is_mentor" className="font-medium text-gray-700">
                        Available as a mentor
                      </label>
                      <p className="text-gray-500">
                        I am willing to mentor other alumni in my area of expertise.
                      </p>
                    </div>
                  </div>
                  
                  {formData.is_mentor && (
                    <div className="mt-6">
                      <label htmlFor="mentor_topics" className="block text-sm font-medium text-gray-700">
                        Mentorship Topics
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="mentor_topics"
                          name="mentor_topics"
                          rows={3}
                          value={formData.mentor_topics}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                          placeholder="Topics you can mentor on (e.g., Career Development, Industry Insights, Technical Skills)"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-5">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/profile')}
                    className="mr-3"
                  >
                    Skip for now
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 