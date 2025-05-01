'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import PublicPageWrapper from '@/components/auth/PublicPageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockJobs } from '@/mock';

// Simple type definition for jobs
type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary_range?: string;
  job_type: string;
  experience_level: string;
  application_url?: string;
  contact_email?: string;
  posted_by: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
};

export default function JobsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Basic search functionality 
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Load mock jobs data
    function loadJobs() {
      try {
        setLoading(true);
        setError(null);
        
        // Format mock jobs to match our Job type
        const formattedJobs = mockJobs.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          requirements: job.requirements.join('\n'),
          salary_range: job.salary,
          job_type: job.employmentType.toLowerCase(),
          experience_level: job.experienceLevel.toLowerCase().replace('-level', ''),
          application_url: job.applicationLink,
          contact_email: job.contactEmail,
          posted_by: job.postedBy,
          created_at: job.postedDate,
          expires_at: job.applicationDeadline,
          is_active: true
        }));
        
        setJobs(formattedJobs);
      } catch (err) {
        console.error('Error loading jobs:', err);
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    loadJobs();
  }, []);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get job type badge color
  const getJobTypeBadgeColor = (jobType: string) => {
    switch (jobType) {
      case 'full-time': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'internship': return 'bg-yellow-100 text-yellow-800';
      case 'remote': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Simple preview component for non-authenticated users
  const JobsPreview = () => {
    const previewJobs = jobs.slice(0, 2);
    
    return (
      <div className="space-y-4 mt-6">
        <h2 className="text-xl font-semibold">Featured Job Opportunities</h2>
        <p className="text-gray-600">Preview of current openings. Sign in to view all jobs and apply.</p>
        
        <div className="grid gap-4">
          {previewJobs.map(job => (
            <Card key={job.id} className="shadow hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>{job.company} • {job.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{job.description.substring(0, 150)}...</p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className={getJobTypeBadgeColor(job.job_type)}>
                    {job.job_type.replace('-', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  // Main content component for authenticated users
  const JobsContent = () => {
    // Filter jobs based on search term
    const filteredJobs = jobs.filter(job => 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button onClick={() => setSearchTerm('')} variant="outline">
            Clear
          </Button>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            <div className="h-36 bg-gray-100 animate-pulse rounded-md" />
            <div className="h-36 bg-gray-100 animate-pulse rounded-md" />
            <div className="h-36 bg-gray-100 animate-pulse rounded-md" />
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-gray-500">No jobs found matching your criteria.</p>
                <Button onClick={() => setSearchTerm('')} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : (
              filteredJobs.map(job => (
                <Card key={job.id} className="shadow hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription>{job.company} • {job.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{job.description.substring(0, 200)}...</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className={getJobTypeBadgeColor(job.job_type)}>
                        {job.job_type.replace('-', ' ')}
                      </Badge>
                      <Badge variant="outline">
                        {job.experience_level}
                      </Badge>
                      {job.salary_range && (
                        <Badge variant="outline" className="bg-gray-100">
                          {job.salary_range}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <p>Posted: {formatDate(job.created_at)}</p>
                      <p>Deadline: {formatDate(job.expires_at)}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm">
                      Apply Now
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  // Calculate stats for PublicPageWrapper
  const stats = [
    { label: 'Active Jobs', value: String(jobs.length) },
    { label: 'Companies Hiring', value: String(Array.from(new Set(jobs.map(job => job.company))).length) },
    { label: 'Success Rate', value: '78%' }
  ];

  return (
    <PublicPageWrapper
      title="AMET Alumni Job Board"
      description="Connect with job opportunities specifically for our AMET alumni community."
      ctaText="Sign in to access all job opportunities and apply."
      stats={stats}
      previewComponent={<JobsPreview />}
    >
      <JobsContent />
    </PublicPageWrapper>
  );
}
