'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function CreateJobAlertPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    alert_name: '',
    job_titles: '',
    industries: '',
    locations: '',
    job_types: [] as string[],
    min_salary: '',
    keywords: '',
    frequency: 'weekly',
    enabled: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const jobTypes = [
    { id: 'full_time', label: 'Full-time' },
    { id: 'part_time', label: 'Part-time' },
    { id: 'contract', label: 'Contract' },
    { id: 'internship', label: 'Internship' },
    { id: 'remote', label: 'Remote' },
    { id: 'temporary', label: 'Temporary' },
  ];
  
  const frequencies = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'biweekly', label: 'Bi-weekly' },
    { id: 'monthly', label: 'Monthly' },
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleJobTypeChange = (jobTypeId: string) => {
    setFormData(prevData => {
      const currentTypes = [...prevData.job_types];
      if (currentTypes.includes(jobTypeId)) {
        return {
          ...prevData,
          job_types: currentTypes.filter(id => id !== jobTypeId)
        };
      } else {
        return {
          ...prevData,
          job_types: [...currentTypes, jobTypeId]
        };
      }
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate form
      if (!formData.alert_name) {
        setError('Please provide a name for your job alert');
        return;
      }
      
      // Create job alert
      const { error: createError } = await supabase
        .from('job_alerts')
        .insert({
          user_id: user.id,
          alert_name: formData.alert_name,
          job_titles: formData.job_titles,
          industries: formData.industries,
          locations: formData.locations,
          job_types: formData.job_types,
          min_salary: formData.min_salary ? parseInt(formData.min_salary) : null,
          keywords: formData.keywords,
          frequency: formData.frequency,
          enabled: formData.enabled,
          created_at: new Date().toISOString()
        });
        
      if (createError) throw createError;
      
      setSuccess(true);
      
      // Redirect to job alerts page after a brief delay
      setTimeout(() => {
        router.push('/jobs/alerts');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating job alert:', err);
      setError(err.message || 'An error occurred while creating your job alert');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/jobs/alerts" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Job Alerts
          </Link>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            Create Job Alert
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Get notified when jobs matching your criteria are posted.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Job alert created successfully!
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="alert_name" className="block text-sm font-medium text-gray-700">
                  Alert Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="alert_name"
                  id="alert_name"
                  required
                  value={formData.alert_name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Software Engineer Jobs in New York"
                />
              </div>
              
              <div>
                <label htmlFor="job_titles" className="block text-sm font-medium text-gray-700">
                  Job Titles
                </label>
                <textarea
                  id="job_titles"
                  name="job_titles"
                  rows={2}
                  value={formData.job_titles}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
                />
                <p className="mt-1 text-xs text-gray-500">Separate multiple job titles with commas</p>
              </div>
              
              <div>
                <label htmlFor="industries" className="block text-sm font-medium text-gray-700">
                  Industries
                </label>
                <textarea
                  id="industries"
                  name="industries"
                  rows={2}
                  value={formData.industries}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
                <p className="mt-1 text-xs text-gray-500">Separate multiple industries with commas</p>
              </div>
              
              <div>
                <label htmlFor="locations" className="block text-sm font-medium text-gray-700">
                  Locations
                </label>
                <textarea
                  id="locations"
                  name="locations"
                  rows={2}
                  value={formData.locations}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., New York, Remote, London"
                />
                <p className="mt-1 text-xs text-gray-500">Separate multiple locations with commas</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Types
                </label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {jobTypes.map((type) => (
                    <div key={type.id} className="flex items-center">
                      <input
                        id={`job_type_${type.id}`}
                        type="checkbox"
                        checked={formData.job_types.includes(type.id)}
                        onChange={() => handleJobTypeChange(type.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`job_type_${type.id}`} className="ml-2 block text-sm text-gray-700">
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="min_salary" className="block text-sm font-medium text-gray-700">
                  Minimum Salary
                </label>
                <input
                  type="number"
                  name="min_salary"
                  id="min_salary"
                  min="0"
                  value={formData.min_salary}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., 50000"
                />
              </div>
              
              <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                  Keywords
                </label>
                <textarea
                  id="keywords"
                  name="keywords"
                  rows={2}
                  value={formData.keywords}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., python, machine learning, react"
                />
                <p className="mt-1 text-xs text-gray-500">Separate multiple keywords with commas</p>
              </div>
              
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                  Alert Frequency
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {frequencies.map((freq) => (
                    <option key={freq.id} value={freq.id}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  id="enabled"
                  name="enabled"
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
                  Enable this job alert
                </label>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <Button
              type="button"
              variant="outline"
              className="mr-3"
              onClick={() => router.push('/jobs/alerts')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Alert'}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}