'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  description: string;
  requirements: string;
  salary_range?: string;
  contact_email?: string;
  posted_by: string;
  created_at: string;
  poster?: {
    first_name?: string;
    last_name?: string;
  };
};

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  
  useEffect(() => {
    async function loadJobDetails() {
      if (!params.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get job details
        const { data, error } = await supabase
          .from('job_listings')
          .select('*, poster:posted_by(first_name, last_name)')
          .eq('id', params.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setJob(data as Job);
          
          // Check if current user is the job poster
          if (user && data.posted_by === user.id) {
            setIsOwner(true);
          }
          
          // Check if user has already applied
          if (user) {
            const { data: applicationData, error: applicationError } = await supabase
              .from('job_applications')
              .select('*')
              .eq('job_id', params.id)
              .eq('applicant_id', user.id)
              .single();
              
            if (applicationData && !applicationError) {
              setHasApplied(true);
            }
          }
        }
      } catch (err: any) {
        console.error('Error loading job details:', err);
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    }
    
    loadJobDetails();
  }, [params.id, user]);
  
  const handleApply = async () => {
    if (!user || !job) return;
    
    try {
      setApplyLoading(true);
      
      // Insert application into database
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          applicant_id: user.id,
          status: 'pending',
          applied_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      setHasApplied(true);
    } catch (err: any) {
      console.error('Error applying for job:', err);
      setError(err.message || 'Failed to apply for job');
    } finally {
      setApplyLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <div className="mt-4">
              <Link href="/jobs">
                <Button>Back to Jobs</Button>
              </Link>
            </div>
          </div>
        ) : job ? (
          <div>
            <div className="mb-6">
              <Link href="/jobs" className="text-blue-600 hover:text-blue-800 flex items-center">
                <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Job Listings
              </Link>
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold leading-6 text-gray-900">
                      {job.title}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {job.company} • {job.location}
                    </p>
                  </div>
                  {isOwner && (
                    <div className="flex space-x-2">
                      <Link href={`/jobs/${job.id}/edit`}>
                        <Button variant="outline">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/jobs/${job.id}/applications`}>
                        <Button>
                          View Applications
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Job Type
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {job.job_type}
                    </dd>
                  </div>
                  
                  {job.salary_range && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Salary Range
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {job.salary_range}
                      </dd>
                    </div>
                  )}
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Posted On
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(job.created_at)}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Posted By
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {job.poster?.first_name} {job.poster?.last_name}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Description
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                      {job.description}
                    </dd>
                  </div>
                  
                  {job.requirements && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Requirements
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                        {job.requirements}
                      </dd>
                    </div>
                  )}
                  
                  {job.contact_email && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Contact
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a href={`mailto:${job.contact_email}`} className="text-blue-600 hover:text-blue-800">
                          {job.contact_email}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
              
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-t border-gray-200">
                {!isOwner && (
                  <div className="flex justify-end">
                    {hasApplied ? (
                      <div className="bg-green-50 border-l-4 border-green-400 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-green-700">
                              You have already applied for this job.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={handleApply}
                        disabled={applyLoading}
                      >
                        {applyLoading ? 'Applying...' : 'Apply for this Job'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Job not found</p>
            <Link href="/jobs">
              <Button>Back to Jobs</Button>
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}