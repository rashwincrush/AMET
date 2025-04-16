'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function BecomeMenteePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    career_goals: '',
    mentorship_areas: '',
    skills_to_develop: '',
    preferred_mentor_characteristics: '',
    time_commitment: '',
    preferred_communication_method: 'email',
    expectations: ''
  });
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
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
          
          // If user is already registered as a mentee, redirect
          if (data.is_mentee) {
            router.push('/mentorship');
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
      
      // Validate required fields
      if (!formData.career_goals || !formData.mentorship_areas || !formData.skills_to_develop || !formData.time_commitment) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Update user profile to become a mentee
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          is_mentee: true,
          mentee_career_goals: formData.career_goals,
          mentee_mentorship_areas: formData.mentorship_areas,
          mentee_skills_to_develop: formData.skills_to_develop,
          mentee_preferred_mentor: formData.preferred_mentor_characteristics,
          mentee_time_commitment: formData.time_commitment,
          mentee_communication: formData.preferred_communication_method,
          mentee_expectations: formData.expectations
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      setSuccess(true);
      
      // Redirect to mentorship page after a delay
      setTimeout(() => {
        router.push('/mentorship');
      }, 2000);
    } catch (err: any) {
      console.error('Error registering as mentee:', err);
      setError(err.message || 'Failed to register as mentee');
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
            Register as a Mentee
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Connect with experienced mentors who can help you achieve your career goals.
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
            <p>You are now registered as a mentee. Redirecting to the mentorship program...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="career_goals" className="block text-sm font-medium text-gray-700">
                    Career Goals *
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="career_goals"
                      name="career_goals"
                      rows={3}
                      value={formData.career_goals}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Describe your short and long-term career goals"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="mentorship_areas" className="block text-sm font-medium text-gray-700">
                    Areas Seeking Mentorship In *
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="mentorship_areas"
                      name="mentorship_areas"
                      rows={3}
                      value={formData.mentorship_areas}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Specific areas where you need guidance (e.g., Career Advancement, Industry Knowledge, Technical Skills)"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="skills_to_develop" className="block text-sm font-medium text-gray-700">
                    Specific Skills to Develop *
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="skills_to_develop"
                      name="skills_to_develop"
                      rows={3}
                      value={formData.skills_to_develop}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Specific skills you want to develop through mentorship"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="preferred_mentor_characteristics" className="block text-sm font-medium text-gray-700">
                    Preferred Mentor Characteristics
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="preferred_mentor_characteristics"
                      name="preferred_mentor_characteristics"
                      rows={3}
                      value={formData.preferred_mentor_characteristics}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Qualities, experience, or background you're looking for in a mentor"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="time_commitment" className="block text-sm font-medium text-gray-700">
                    Time Commitment Available *
                  </label>
                  <div className="mt-1">
                    <select
                      id="time_commitment"
                      name="time_commitment"
                      value={formData.time_commitment}
                      onChange={handleChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      required
                    >
                      <option value="">Select time commitment</option>
                      <option value="1-2 hours per month">1-2 hours per month</option>
                      <option value="3-5 hours per month">3-5 hours per month</option>
                      <option value="6-10 hours per month">6-10 hours per month</option>
                      <option value="More than 10 hours per month">More than 10 hours per month</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="preferred_communication_method" className="block text-sm font-medium text-gray-700">
                    Preferred Communication Method *
                  </label>
                  <select
                    id="preferred_communication_method"
                    name="preferred_communication_method"
                    value={formData.preferred_communication_method}
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
                  <label htmlFor="expectations" className="block text-sm font-medium text-gray-700">
                    Brief Statement of Expectations
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="expectations"
                      name="expectations"
                      rows={3}
                      value={formData.expectations}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="What do you hope to achieve through the mentorship program?"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <Button
                type="button"
                variant="outline"
                className="mr-3"
                onClick={() => router.push('/mentorship')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Register as Mentee'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </ProtectedRoute>
  );
} 