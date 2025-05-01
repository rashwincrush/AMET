'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function PostJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    job_type: 'Full-time',
    description: '',
    requirements: '',
    salary_range: '',
    contact_email: '',
    education_requirements: '',
    application_deadline: '',
    external_url: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const jobTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Internship',
    'Remote',
    'Temporary',
    'Volunteer',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!formData.title || !formData.company || !formData.location || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Insert job listing into database
      const { data, error } = await supabase
        .from('job_listings')
        .insert([
          {
            ...formData,
            posted_by: user?.id,
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      // Redirect to job listing page
      router.push('/jobs');
    } catch (err: any) {
      console.error('Error posting job:', err);
      setError(err.message || 'An error occurred while posting the job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/jobs" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Job Listings
          </Link>
          <h1 className="text-3xl font-bold mt-2">Post a Job</h1>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md text-red-600 mb-6">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
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
                <label htmlFor="external_url" className="block text-sm font-medium text-gray-700 mb-1">External Application URL (Optional)</label>
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
                onClick={() => router.push('/jobs')}
                className="mr-4"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Posting...' : 'Post Job'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}