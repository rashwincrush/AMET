'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

type JobApplication = {
  id: string;
  job_id: string;
  applicant_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  updated_at: string;
  applicant: {
    first_name: string;
    last_name: string;
    email: string;
    current_position?: string;
    current_company?: string;
  };
};

type Job = {
  id: string;
  title: string;
  company: string;
  posted_by: string;
};

export default function JobApplicationsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);

  useEffect(() => {
    loadJobAndApplications();
  }, [params.id]);

  async function loadJobAndApplications() {
    if (!params.id || !user) return;

    try {
      setLoading(true);
      setError(null);

      // First, get the job details and verify ownership
      const { data: jobData, error: jobError } = await supabase
        .from('job_listings')
        .select('*')
        .eq('id', params.id)
        .single();

      if (jobError) throw jobError;

      if (!jobData) {
        setError('Job not found');
        return;
      }

      if (jobData.posted_by !== user.id) {
        setError('You do not have permission to view these applications');
        return;
      }

      setJob(jobData);

      // Then, get all applications for this job
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select(`
          *,
          applicant:profiles(
            first_name,
            last_name,
            email,
            current_position,
            current_company
          )
        `)
        .eq('job_id', params.id)
        .order('applied_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      setApplications(applicationsData || []);
    } catch (err: any) {
      console.error('Error loading applications:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }

  async function updateApplicationStatus(applicationId: string, newStatus: 'accepted' | 'rejected') {
    try {
      setUpdateLoading(applicationId);
      setError(null);

      const { error } = await supabase
        .from('job_applications')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Refresh applications list
      await loadJobAndApplications();
    } catch (err: any) {
      console.error('Error updating application:', err);
      setError(err.message || 'Failed to update application status');
    } finally {
      setUpdateLoading(null);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
              <Link href={`/jobs/${job.id}`} className="text-blue-600 hover:text-blue-800">
                &larr; Back to Job Details
              </Link>
              <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
                Applications for {job.title}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {job.company}
              </p>
            </div>

            {applications.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <p className="text-gray-500">No applications received yet.</p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                  {applications.map((application) => (
                    <li key={application.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {application.applicant.first_name} {application.applicant.last_name}
                          </h3>
                          <div className="mt-1 text-sm text-gray-500">
                            {application.applicant.current_position && (
                              <p>{application.applicant.current_position} {application.applicant.current_company && `at ${application.applicant.current_company}`}</p>
                            )}
                            <p>Applied on {formatDate(application.applied_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant={application.status === 'accepted' ? 'default' : 'outline'}
                            onClick={() => updateApplicationStatus(application.id, 'accepted')}
                            disabled={updateLoading === application.id || application.status === 'accepted'}
                          >
                            {application.status === 'accepted' ? 'Accepted' : 'Accept'}
                          </Button>
                          <Button
                            variant={application.status === 'rejected' ? 'destructive' : 'outline'}
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            disabled={updateLoading === application.id || application.status === 'rejected'}
                          >
                            {application.status === 'rejected' ? 'Rejected' : 'Reject'}
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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