'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function BecomeMentorPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    mentor_topics: '',
    mentor_bio: '',
    availability: '',
    preferred_communication: 'email',
    mentorship_style: '',
    expectations: '',
    mentoring_capacity: '',
    max_mentees: '',
    mentoring_experience: ''
  });
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shouldBecomeMentee, setShouldBecomeMentee] = useState(false);
  
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get user profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setUserProfile(data);
          
          // If user is already a mentor, redirect to mentorship page
          if (data.is_mentor) {
            router.push('/mentorship/mentees');
            return;
          }
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [user, router]);
  
  useEffect(() => {
    // Check if we should redirect to mentee registration after completion
    const searchParams = new URLSearchParams(window.location.search);
    setShouldBecomeMentee(searchParams.get('become_mentee') === 'true');
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Update user profile to become a mentor
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          is_mentor: true,
          mentor_topics: formData.mentor_topics,
          mentor_bio: formData.mentor_bio || userProfile.bio,
          mentor_availability: formData.availability,
          mentor_communication: formData.preferred_communication,
          mentor_style: formData.mentorship_style,
          mentor_expectations: formData.expectations,
          mentor_capacity: formData.mentoring_capacity,
          max_mentees: formData.max_mentees ? parseInt(formData.max_mentees) : null,
          mentoring_experience: formData.mentoring_experience
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      setSuccess(true);
      
      // Redirect to mentorship page after a delay
      setTimeout(() => {
        if (shouldBecomeMentee) {
          router.push('/mentorship/become-mentee');
        } else {
          router.push('/mentorship/mentees');
        }
      }, 2000);
    } catch (err: any) {
      console.error('Error becoming a mentor:', err);
      setError(err.message || 'Failed to become a mentor');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/mentorship" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Mentorship
          </Link>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            Become a Mentor
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Share your knowledge and experience with fellow alumni.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Success!</p>
            <p>You are now registered as a mentor. Redirecting to your mentee dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="mentor_topics" className="block text-sm font-medium text-gray-700">
                    Mentorship Topics *
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="mentor_topics"
                      name="mentor_topics"
                      rows={3}
                      value={formData.mentor_topics}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Topics you can mentor on (e.g., Career Development, Industry Insights, Technical Skills)"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    List the specific areas where you can provide guidance and mentorship.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="mentor_bio" className="block text-sm font-medium text-gray-700">
                    Mentor Bio
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="mentor_bio"
                      name="mentor_bio"
                      rows={4}
                      value={formData.mentor_bio}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Share your professional journey and why you want to be a mentor"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    If left blank, your general profile bio will be used.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                    Availability *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="availability"
                      id="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="e.g., 2 hours per week, evenings and weekends"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="preferred_communication" className="block text-sm font-medium text-gray-700">
                    Preferred Communication Method *
                  </label>
                  <select
                    id="preferred_communication"
                    name="preferred_communication"
                    value={formData.preferred_communication}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="email">Email</option>
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                    <option value="in-person">In-Person</option>
                    <option value="messaging">Messaging</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="mentorship_style" className="block text-sm font-medium text-gray-700">
                    Mentorship Style *
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="mentorship_style"
                      name="mentorship_style"
                      rows={3}
                      value={formData.mentorship_style}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Describe your approach to mentoring"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="mentoring_capacity" className="block text-sm font-medium text-gray-700">
                    Mentoring Capacity (Hours per Month) *
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="mentoring_capacity"
                      id="mentoring_capacity"
                      value={formData.mentoring_capacity}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="e.g., 5"
                      required
                      min="1"
                      max="100"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    How many hours per month can you dedicate to mentoring?
                  </p>
                </div>
                
                <div>
                  <label htmlFor="max_mentees" className="block text-sm font-medium text-gray-700">
                    Maximum Number of Mentees *
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="max_mentees"
                      id="max_mentees"
                      value={formData.max_mentees}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="e.g., 3"
                      required
                      min="1"
                      max="20"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    How many mentees are you willing to work with simultaneously?
                  </p>
                </div>
                
                <div>
                  <label htmlFor="mentoring_experience" className="block text-sm font-medium text-gray-700">
                    Mentoring Experience
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="mentoring_experience"
                      name="mentoring_experience"
                      rows={3}
                      value={formData.mentoring_experience}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Describe any previous mentoring experience you have"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="expectations" className="block text-sm font-medium text-gray-700">
                    Expectations from Mentees *
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="expectations"
                      name="expectations"
                      rows={3}
                      value={formData.expectations}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="What do you expect from your mentees?"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/mentorship')}
                className="mr-3"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Become a Mentor'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </ProtectedRoute>
  );
} 