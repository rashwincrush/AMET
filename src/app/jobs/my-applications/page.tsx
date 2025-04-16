'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Badge } from '@/components/ui/badge';

type JobApplication = {
  id: string;
  job_id: string;
  applicant_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  updated_at: string;
  job: {
    title: string;
    company: string;
    location: string;
    job_type: string;
    salary_range?: string;
    contact_email?: string;
  };
};

export default function MyApplicationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:job_listings(
            title,
            company,
            location,
            job_type,
            salary_range,
            contact_email
          )
        `)
        .eq('applicant_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
    } catch (err: any) {
      console.error('Error loading applications:', err);
      setError(err.message || 'Failed to load your applications');
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/jobs" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Job Listings
          </Link>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            My Job Applications
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track the status of your job applications
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-4">Start applying for jobs to see your applications here.</p>
            <Link href="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {applications.map((application) => (
                <li key={application.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link href={`/jobs/${application.job_id}`}>
                        <h3 className="text-lg font-medium text-blue-600 hover:text-blue-800">
                          {application.job.title}
                        </h3>
                      </Link>
                      <div className="mt-1 text-sm text-gray-500">
                        <p>{application.job.company} • {application.job.location}</p>
                        <p>Applied on {formatDate(application.applied_at)}</p>
                        {application.job.salary_range && (
                          <p>Salary Range: {application.job.salary_range}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge className={getStatusBadgeVariant(application.status)}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                      {application.job.contact_email && application.status === 'accepted' && (
                        <a
                          href={`mailto:${application.job.contact_email}`}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Contact Employer
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 