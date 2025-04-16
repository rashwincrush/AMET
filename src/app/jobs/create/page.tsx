'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function CreateJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salary_range: '',
    job_type: 'full-time',
    experience_level: 'mid',
    application_url: '',
    contact_email: '',
    expires_at: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to post a job');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Set expiration date to 30 days from now if not provided
      const expiresAt = formData.expires_at 
        ? new Date(formData.expires_at).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('jobs')
        .insert([
          {
            ...formData,
            posted_by: user.id,
            expires_at: expiresAt,
            is_active: true
          }
        ])
        .select();
      
      if (error) throw error;
      
      router.push('/jobs');
    } catch (err: any) {
      console.error('Error creating job:', err);
      setError(err.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/jobs" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Jobs
          </Link>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            Post a New Job
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Share job opportunities with the alumni community.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Job Title */}
            <div className="sm:col-span-3">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Job Title *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Company */}
            <div className="sm:col-span-3">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Company *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="company"
                  id="company"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Location */}
            <div className="sm:col-span-3">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="location"
                  id="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="City, State or Remote"
                />
              </div>
            </div>
            
            {/* Job Type */}
            <div className="sm:col-span-3">
              <label htmlFor="job_type" className="block text-sm font-medium text-gray-700">
                Job Type *
              </label>
              <div className="mt-1">
                <select
                  id="job_type"
                  name="job_type"
                  required
                  value={formData.job_type}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
            </div>
            
            {/* Experience Level */}
            <div className="sm:col-span-3">
              <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700">
                Experience Level *
              </label>
              <div className="mt-1">
                <select
                  id="experience_level"
                  name="experience_level"
                  required
                  value={formData.experience_level}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>
            
            {/* Salary Range */}
            <div className="sm:col-span-3">
              <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700">
                Salary Range
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="salary_range"
                  id="salary_range"
                  value={formData.salary_range}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g. $50,000 - $70,000"
                />
              </div>
            </div>
            
            {/* Expiration Date */}
            <div className="sm:col-span-3">
              <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700">
                Listing Expiration Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="expires_at"
                  id="expires_at"
                  value={formData.expires_at}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-500">If not specified, job will expire in 30 days</p>
              </div>
            </div>
            
            {/* Description */}
            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Job Description *
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Requirements */}
            <div className="sm:col-span-6">
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                Job Requirements *
              </label>
              <div className="mt-1">
                <textarea
                  id="requirements"
                  name="requirements"
                  rows={4}
                  required
                  value={formData.requirements}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="List qualifications, skills, and experience required"
                />
              </div>
            </div>
            
            {/* Application URL */}
            <div className="sm:col-span-3">
              <label htmlFor="application_url" className="block text-sm font-medium text-gray-700">
                Application URL
              </label>
              <div className="mt-1">
                <input
                  type="url"
                  name="application_url"
                  id="application_url"
                  value={formData.application_url}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://"
                />
              </div>
            </div>
            
            {/* Contact Email */}
            <div className="sm:col-span-3">
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                Contact Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="contact_email"
                  id="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-5">
            <div className="flex justify-end">
              <Link href="/jobs">
                <Button type="button" variant="outline" className="mr-3">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Posting...' : 'Post Job'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}