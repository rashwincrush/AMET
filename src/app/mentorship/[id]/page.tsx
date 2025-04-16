'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

type Mentor = {
  id: string;
  first_name?: string;
  last_name?: string;
  graduation_year?: number;
  degree?: string;
  major?: string;
  current_position?: string;
  current_company?: string;
  location?: string;
  bio?: string;
  mentor_bio?: string;
  mentor_topics?: string;
  mentor_availability?: string;
  mentor_communication?: string;
  mentor_style?: string;
  mentor_expectations?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  avatar_url?: string;
  industry?: string;
  is_mentor: boolean;
};

export default function MentorProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  
  useEffect(() => {
    async function loadMentorProfile() {
      if (!params.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get mentor profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', params.id)
          .eq('is_mentor', true)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setMentor(data as Mentor);
          
          // Check if user has already sent a request to this mentor
          if (user) {
            const { data: requestData, error: requestError } = await supabase
              .from('mentorship_requests')
              .select('*')
              .eq('mentor_id', params.id)
              .eq('mentee_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1);
              
            if (!requestError && requestData && requestData.length > 0) {
              setExistingRequest(requestData[0]);
              if (requestData[0].status === 'pending') {
                setRequestSent(true);
              }
            }
          }
        }
      } catch (err: any) {
        console.error('Error loading mentor profile:', err);
        setError(err.message || 'Failed to load mentor profile');
      } finally {
        setLoading(false);
      }
    }
    
    loadMentorProfile();
  }, [params.id, user]);
  
  const handleSendRequest = async () => {
    if (!user || !mentor) return;
    
    try {
      setSendingRequest(true);
      
      // Insert mentorship request into database
      const { error } = await supabase
        .from('mentorship_requests')
        .insert({
          mentor_id: mentor.id,
          mentee_id: user.id,
          status: 'pending',
          message: 'I would like to connect with you as a mentor.',
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      setRequestSent(true);
    } catch (err: any) {
      console.error('Error sending mentorship request:', err);
      setError(err.message || 'Failed to send mentorship request');
    } finally {
      setSendingRequest(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/mentorship" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Mentors
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : mentor ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold leading-6 text-gray-900">
                  {mentor.first_name} {mentor.last_name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {mentor.current_position} {mentor.current_company ? `at ${mentor.current_company}` : ''}
                </p>
              </div>
              <div className="flex-shrink-0">
                {mentor.avatar_url ? (
                  <img
                    className="h-24 w-24 rounded-full"
                    src={mentor.avatar_url}
                    alt=""
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                {mentor.graduation_year && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Graduation Year
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {mentor.graduation_year}
                    </dd>
                  </div>
                )}
                
                {mentor.degree && mentor.major && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Education
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {mentor.degree} in {mentor.major}
                    </dd>
                  </div>
                )}
                
                {mentor.location && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Location
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {mentor.location}
                    </dd>
                  </div>
                )}
                
                {mentor.industry && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Industry
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {mentor.industry}
                    </dd>
                  </div>
                )}
                
                {(mentor.mentor_bio || mentor.bio) && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      About
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                      {mentor.mentor_bio || mentor.bio}
                    </dd>
                  </div>
                )}
                
                {mentor.mentor_topics && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Mentorship Topics
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                      {mentor.mentor_topics}
                    </dd>
                  </div>
                )}
                
                {mentor.mentor_availability && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Availability
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {mentor.mentor_availability}
                    </dd>
                  </div>
                )}
                
                {mentor.mentor_communication && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Preferred Communication
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {mentor.mentor_communication}
                    </dd>
                  </div>
                )}
                
                {mentor.mentor_style && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Mentorship Style
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                      {mentor.mentor_style}
                    </dd>
                  </div>
                )}
                
                {mentor.mentor_expectations && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Expectations from Mentees
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                      {mentor.mentor_expectations}
                    </dd>
                  </div>
                )}
                
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Connect
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="flex space-x-4">
                      {mentor.linkedin_url && (
                        <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          LinkedIn
                        </a>
                      )}
                      {mentor.twitter_url && (
                        <a href={mentor.twitter_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          Twitter
                        </a>
                      )}
                      {mentor.website_url && (
                        <a href={mentor.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          Website
                        </a>
                      )}
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
            
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-t border-gray-200">
              {user?.id !== mentor.id ? (
                <div className="flex justify-end">
                  {requestSent ? (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">
                            Mentorship request sent. You'll be notified when {mentor.first_name} responds.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : existingRequest && existingRequest.status === 'accepted' ? (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">
                            {mentor.first_name} is your mentor! Go to your <Link href="/mentorship/my-mentors" className="underline">mentors page</Link> to message them.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : existingRequest && existingRequest.status === 'rejected' ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            Previous request was declined. The mentor may not have availability at this time.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button
                          onClick={handleSendRequest}
                          disabled={sendingRequest}
                        >
                          {sendingRequest ? 'Sending...' : 'Send New Request'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={handleSendRequest}
                      disabled={sendingRequest}
                    >
                      {sendingRequest ? 'Sending...' : 'Request Mentorship'}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        This is your mentor profile. <Link href="/mentorship/mentees" className="underline">View your mentees</Link> or <Link href="/mentorship/edit-profile" className="underline">edit your mentor profile</Link>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Mentor not found</p>
            <Link href="/mentorship">
              <Button>Back to Mentors</Button>
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 