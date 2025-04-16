'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import PublicPageWrapper from '@/components/auth/PublicPageWrapper';
import EnhancedPageHeader from '@/components/ui/EnhancedPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FaBriefcase, FaBuilding, FaMapMarkerAlt, FaRegClock, FaFilter, FaChevronLeft, FaChevronRight, FaBell, FaPlus, FaSearch, FaGraduationCap } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary_range?: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  experience_level: 'entry' | 'mid' | 'senior' | 'executive';
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
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('');
  const [experienceLevelFilter, setExperienceLevelFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeView, setActiveView] = useState('all');
  const itemsPerPage = 5;
  
  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        setError(null);
        
        // Get all active jobs
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .gte('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          setJobs(data as Job[]);
        }
      } catch (err: any) {
        console.error('Error loading jobs:', err);
        setError(err.message || 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    }
    
    loadJobs();
  }, []);
  
  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesJobType = !jobTypeFilter || job.job_type === jobTypeFilter;
    const matchesExperienceLevel = !experienceLevelFilter || job.experience_level === experienceLevelFilter;
    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    // Filter based on active view tab
    const matchesViewFilter = 
      activeView === 'all' || 
      (activeView === 'recent' && new Date(job.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) || 
      (activeView === 'remote' && job.job_type === 'remote');
    
    return matchesSearch && matchesJobType && matchesExperienceLevel && matchesLocation && matchesViewFilter;
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate days remaining until expiration
  const getDaysRemaining = (expiresAt: string) => {
    const today = new Date();
    const expirationDate = new Date(expiresAt);
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Format job type for display
  const formatJobType = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Format experience level for display
  const formatExperienceLevel = (level: string) => {
    switch(level) {
      case 'entry': return 'Entry Level';
      case 'mid': return 'Mid Level';
      case 'senior': return 'Senior Level';
      case 'executive': return 'Executive';
      default: return level;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setJobTypeFilter('');
    setExperienceLevelFilter('');
    setLocationFilter('');
    setCurrentPage(1);
  };

  // Get job type badge color
  const getJobTypeBadgeColor = (jobType: string) => {
    switch(jobType) {
      case 'full-time': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'part-time': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'contract': return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'internship': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'remote': return 'bg-teal-100 text-teal-800 hover:bg-teal-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Get experience level badge color
  const getExperienceBadgeColor = (level: string) => {
    switch(level) {
      case 'entry': return 'bg-green-100 text-green-800 border-green-200';
      case 'mid': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'senior': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'executive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Preview component for non-authenticated users
  const JobsPreview = () => {
    const previewJobs = jobs.slice(0, 3);
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Featured Job Opportunities</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {previewJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-blue-600 truncate">{job.title}</CardTitle>
                <CardDescription>{job.company}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-2">
                  <Badge className={getJobTypeBadgeColor(job.job_type)}>
                    {formatJobType(job.job_type)}
                  </Badge>
                  <span className="text-sm text-gray-500 ml-2">{job.location}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>
                <div className="mt-3 text-sm text-gray-500">
                  Posted on {formatDate(job.created_at)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          Sign in to view all job listings and apply
        </p>
      </div>
    );
  };

  // Loading skeleton
  const JobSkeleton = () => (
    <div className="bg-white shadow rounded-lg mb-4 p-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-6 w-64 mb-2" />
          <Skeleton className="h-4 w-48 mt-3" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="mt-4">
        <div className="flex space-x-4 mt-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-full mt-4" />
        <Skeleton className="h-4 w-full mt-2" />
      </div>
    </div>
  );

  // Main content component for authenticated users
  const JobsContent = () => {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <EnhancedPageHeader
          title="Alumni Job Board"
          description="Find career opportunities shared by fellow alumni and industry partners"
          icon={<FaBriefcase className="h-6 w-6 text-blue-500" />}
          background="light"
          actions={
            <div className="flex gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/jobs/alerts">
                      <Button variant="outline" className="border-blue-600 text-blue-600">
                        <FaBell className="mr-2 h-4 w-4" />
                        Job Alerts
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get notified about new job postings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/jobs/create">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                        <FaPlus className="mr-2 h-4 w-4" />
                        Post a Job
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share a job opportunity with the alumni community</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          }
        />
        
        {/* Job Board Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="mr-4 p-3 bg-blue-100 rounded-full">
                  <FaBriefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="mr-4 p-3 bg-green-100 rounded-full">
                  <FaBuilding className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Companies Hiring</p>
                  <p className="text-2xl font-bold text-gray-900">{Array.from(new Set(jobs.map(job => job.company))).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="mr-4 p-3 bg-purple-100 rounded-full">
                  <FaGraduationCap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Application Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">78%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* View Tabs */}
        <Tabs 
          defaultValue="all" 
          className="mb-6"
          onValueChange={(value) => {
            setActiveView(value);
            setCurrentPage(1);
          }}
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="recent">Recent (7 days)</TabsTrigger>
            <TabsTrigger value="remote">Remote Positions</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow rounded-lg mb-8"
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
              {/* Search */}
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Jobs
                </label>
                <div className="relative rounded-md shadow-sm">
                  <Input
                    type="text"
                    name="search"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pr-10 border-gray-300"
                    placeholder="Search by title, company, or description"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:w-2/3">
                {/* Job Type Filter */}
                <div>
                  <label htmlFor="job-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type
                  </label>
                  <select
                    id="job-type"
                    name="job-type"
                    value={jobTypeFilter}
                    onChange={(e) => {
                      setJobTypeFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Types</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
                
                {/* Experience Level Filter */}
                <div>
                  <label htmlFor="experience-level" className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    id="experience-level"
                    name="experience-level"
                    value={experienceLevelFilter}
                    onChange={(e) => {
                      setExperienceLevelFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Levels</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                
                {/* Filter actions */}
                <div className="flex items-end">
                  <Button 
                    onClick={clearFilters}
                    variant="outline"
                    className="w-full flex items-center justify-center text-sm"
                  >
                    <FaFilter className="mr-2 h-4 w-4" />
                    Reset Filters
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              Found {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
            </div>
          </div>
        </motion.div>
        
        {/* Job Listings */}
        {loading ? (
          <div className="space-y-4">
            <JobSkeleton />
            <JobSkeleton />
            <JobSkeleton />
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12 bg-white rounded-lg shadow"
          >
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || jobTypeFilter || experienceLevelFilter || locationFilter || activeView !== 'all'
                ? 'Try adjusting your search filters'
                : 'No jobs have been posted yet'}
            </p>
            <div className="mt-6">
              <Link href="/jobs/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <FaPlus className="mr-2 h-4 w-4" />
                  Post a Job
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <AnimatePresence>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {paginatedJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
                      <Link href={`/jobs/${job.id}`}>
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                            <div>
                              <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-150">
                                {job.title}
                              </h3>
                              <div className="mt-2 flex items-center text-sm text-gray-700">
                                <FaBuilding className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500" />
                                {job.company}
                              </div>
                            </div>
                            
                            <div className="mt-2 sm:mt-0 flex items-center">
                              <Badge className={`
                                px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${getDaysRemaining(job.expires_at) <= 3 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                              `}>
                                {getDaysRemaining(job.expires_at) <= 0
                                  ? 'Expired'
                                  : getDaysRemaining(job.expires_at) <= 3
                                    ? `${getDaysRemaining(job.expires_at)} days left`
                                    : 'Active'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="mt-4 sm:flex sm:justify-between">
                            <div className="sm:flex flex-wrap gap-2">
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <FaMapMarkerAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {job.location}
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <Badge className={getJobTypeBadgeColor(job.job_type)}>
                                  {formatJobType(job.job_type)}
                                </Badge>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <Badge variant="outline" className={getExperienceBadgeColor(job.experience_level)}>
                                  {formatExperienceLevel(job.experience_level)}
                                </Badge>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <FaRegClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              Posted {formatDate(job.created_at)}
                            </div>
                          </div>
                          
                          <div className="mt-4 text-sm text-gray-700 line-clamp-2">
                            {job.description}
                          </div>
                        </CardContent>
                        <CardFooter className="bg-gray-50 px-6 py-3">
                          <span className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">
                            View Details →
                          </span>
                        </CardFooter>
                      </Link>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredJobs.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredJobs.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <Button
                        variant="outline"
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <span className="sr-only">Previous</span>
                        <FaChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <Button
                          key={i}
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === i + 1 
                              ? 'bg-blue-600 text-white' 
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        <span className="sr-only">Next</span>
                        <FaChevronRight className="h-4 w-4" />
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
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
      description="Connect with job opportunities specifically for our AMET alumni community. Find positions posted by fellow alumni and industry partners."
      ctaText="Sign in to access all job opportunities, post jobs, and set up job alerts."
      stats={stats}
      previewComponent={<JobsPreview />}
    >
      <JobsContent />
    </PublicPageWrapper>
  );
}