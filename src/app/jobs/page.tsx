'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import PublicPageWrapper from '@/components/auth/PublicPageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { marineJobs } from '@/mock';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Job type definition
type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  employmentType: string;
  postedDate: string;
  applicationDeadline: string;
  postedBy: string;
  contactEmail: string;
  logo?: string;
  isRemote: boolean;
  experienceLevel: string;
  industry: string;
  applicationLink?: string;
  tags: string[];
};

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getJobTypeBadgeColor = (jobType: string) => {
  switch (jobType.toLowerCase()) {
    case 'full-time': return 'bg-green-100 text-green-800';
    case 'part-time': return 'bg-blue-100 text-blue-800';
    case 'contract': return 'bg-purple-100 text-purple-800';
    case 'internship': return 'bg-yellow-100 text-yellow-800';
    case 'remote': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function JobsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // State management
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Load jobs data
  useEffect(() => {
    try {
      setLoading(true);
      setJobs(marineJobs);
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Event handlers
  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsDialogOpen(true);
  };
  
  const handleApply = (job: Job) => {
    if (job.applicationLink) {
      window.open(job.applicationLink, '_blank');
    } else {
      window.location.href = `mailto:${job.contactEmail}?subject=Application for ${job.title} Position&body=Dear Hiring Manager,%0D%0A%0D%0AI am writing to express my interest in the ${job.title} position at ${job.company}.%0D%0A%0D%0A[Include your qualifications and experience here]%0D%0A%0D%0AThank you for your consideration.%0D%0A%0D%0ASincerely,%0D%0A[Your Name]`;
    }
  };

  // Calculate stats for PublicPageWrapper
  const stats = [
    { label: 'Active Jobs', value: String(jobs.length) },
    { label: 'Companies Hiring', value: String(Array.from(new Set(jobs.map(job => job.company))).length) },
    { label: 'Success Rate', value: '78%' }
  ];

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Component: Job Requirements List
  const JobRequirements = ({ requirements }: { requirements: string[] }) => (
    <ul className="list-disc pl-5 space-y-1">
      {requirements.map((req, index) => (
        <li key={index} className="text-sm">{req}</li>
      ))}
    </ul>
  );
  
  // Component: Job Preview for non-authenticated users
  const JobsPreview = () => {
    const previewJobs = jobs.slice(0, 2);
    
    return (
      <div className="space-y-4 mt-6">
        <h2 className="text-xl font-semibold">Featured Marine Industry Jobs</h2>
        <p className="text-gray-600">Preview of current maritime openings. Sign in to view all jobs and apply.</p>
        
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
                  <Badge variant="outline" className={getJobTypeBadgeColor(job.employmentType)}>
                    {job.employmentType}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  // Component: Job Details Dialog
  const JobDetailsDialog = () => {
    if (!selectedJob) return null;
    
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedJob.title}</DialogTitle>
            <DialogDescription className="text-lg font-medium">
              {selectedJob.company} • {selectedJob.location}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className={getJobTypeBadgeColor(selectedJob.employmentType)}>
              {selectedJob.employmentType}
            </Badge>
            <Badge variant="outline">
              {selectedJob.experienceLevel}
            </Badge>
            {selectedJob.salary && (
              <Badge variant="outline" className="bg-gray-100">
                {selectedJob.salary}
              </Badge>
            )}
            {selectedJob.isRemote && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Remote Available
              </Badge>
            )}
            <Badge variant="outline" className="bg-teal-100 text-teal-800">
              {selectedJob.industry}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                <p className="text-gray-700">{selectedJob.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                <JobRequirements requirements={selectedJob.requirements} />
              </div>
            </div>
            
            <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold mb-2">Job Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Posted by:</span> {selectedJob.postedBy}</p>
                  <p><span className="font-medium">Posted Date:</span> {formatDate(selectedJob.postedDate)}</p>
                  <p><span className="font-medium">Application Deadline:</span> {formatDate(selectedJob.applicationDeadline)}</p>
                  <p><span className="font-medium">Contact:</span> {selectedJob.contactEmail}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <Button 
                  className="w-full mb-2" 
                  onClick={() => handleApply(selectedJob)}
                >
                  Apply Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Component: Main content for authenticated users
  const JobsContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search marine industry jobs..."
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
                <p className="text-gray-500">No maritime jobs found matching your criteria.</p>
                <Button onClick={() => setSearchTerm('')} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-blue-900">Maritime Industry Opportunities</h2>
                <p className="text-gray-600 mb-4">Exclusive job listings for AMET alumni in the maritime sector.</p>
                
                {filteredJobs.map(job => (
                  <Card key={job.id} className="shadow hover:shadow-md transition-shadow border-l-4 border-blue-600">
                    <CardHeader>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription className="text-base">{job.company} • {job.location}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{job.description.substring(0, 200)}...</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className={getJobTypeBadgeColor(job.employmentType)}>
                          {job.employmentType}
                        </Badge>
                        <Badge variant="outline">
                          {job.experienceLevel}
                        </Badge>
                        {job.salary && (
                          <Badge variant="outline" className="bg-gray-100">
                            {job.salary}
                          </Badge>
                        )}
                        {job.isRemote && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Remote Available
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <p>Posted: {formatDate(job.postedDate)}</p>
                        <p>Deadline: {formatDate(job.applicationDeadline)}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(job)}>
                        View Details
                      </Button>
                      <Button size="sm" onClick={() => handleApply(job)}>
                        Apply Now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
        
        {/* Job Details Dialog */}
        <JobDetailsDialog />
      </div>
    );
  };

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