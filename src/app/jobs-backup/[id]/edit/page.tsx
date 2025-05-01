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
  education_requirements?: string;
  application_deadline?: string;
  external_url?: string;
  posted_by: string;
};

export default function EditJobPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    job_type: '',
    description: '',
    requirements: '',
    salary_range: '',
    contact_email: '',
    education_requirements: '',
    application_deadline: '',
    external_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const jobTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Internship',
    'Remote',
    'Temporary',
    'Volunteer',
  ];

  useEffect(() => {
    loadJob();
  }, [params.id]);

  async function loadJob() {
    if (!params.id || !user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;

      if (!data) {
        setError('Job not found');
        return;
      }

      if (data.posted_by !== user.id) {
        setError('You do not have permission to edit this job posting');
        return;
      }

      setJob(data);
      setFormData({
        title: data.title || '',
        company: data.company || '',
        location: data.location || '',
        job_type: data.job_type || 'Full-time',
        description: data.description || '',
        requirements: data.requirements || '',
        salary_range: data.salary_range || '',
        contact_email: data.contact_email || '',
        education_requirements: data.education_requirements || '',
        application_deadline: data.application_deadline || '',
        external_url: data.external_url || ''
      });
    } catch (err: any) {
      console.error('Error loading job:', err);
      setError(err.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from('job_listings')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (error) throw error;

      router.push(`/jobs/${job.id}`);
    } catch (err: any) {
      console.error('Error updating job:', err);
      setError(err.message || 'Failed to update job posting');
    } finally {
      setSaving(false);
    }
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
                Edit Job Posting
              </h2>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                    <select
                      id="job_type"
                      name="job_type"
                      value={formData.job_type}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      {jobTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                    <input
                      type="text"
                      id="salary_range"
                      name="salary_range"
                      value={formData.salary_range}
                      onChange={handleChange}
                      placeholder="e.g. $50,000 - $70,000"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    ></textarea>
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                    <textarea
                      id="requirements"
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    ></textarea>
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="education_requirements" className="block text-sm font-medium text-gray-700 mb-1">Education Requirements</label>
                    <textarea
                      id="education_requirements"
                      name="education_requirements"
                      value={formData.education_requirements}
                      onChange={handleChange}
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Bachelor's degree in Computer Science or related field"
                    ></textarea>
                  </div>

                  <div>
                    <label htmlFor="application_deadline" className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                    <input
                      type="date"
                      id="application_deadline"
                      name="application_deadline"
                      value={formData.application_deadline}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label htmlFor="external_url" className="block text-sm font-medium text-gray-700 mb-1">External Application URL</label>
                    <input
                      type="url"
                      id="external_url"
                      name="external_url"
                      value={formData.external_url}
                      onChange={handleChange}
                      placeholder="https://example.com/careers/job123"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                    <input
                      type="email"
                      id="contact_email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    className="mr-4"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
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