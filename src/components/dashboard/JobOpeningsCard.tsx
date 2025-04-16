'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary_range?: string;
  created_at: string;
  is_active: boolean;
};

export function JobOpeningsCard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Use callback to allow reusing the fetch function for initial load and refreshes
  const fetchJobs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchJobs();

    // Set up real-time subscription
    const subscription = supabase
      .channel('jobs-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'jobs' }, 
        (payload) => {
          console.log('Real-time update received:', payload);
          // Refresh the jobs list when changes occur
          fetchJobs();
        }
      )
      .subscribe();

    // Clean up subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchJobs]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="rounded-2xl overflow-hidden shadow-xl border-0 bg-white dark:bg-gray-800 transform transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 border-b-0 pb-12 relative">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="6,3" />
          </svg>
        </div>
        <div className="relative">
          <div className="flex items-center">
            <div className="mr-4 w-14 h-14 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-lg border border-white/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white mb-1">Job Opportunities</CardTitle>
              <CardDescription className="text-green-100 font-medium">Latest openings in our network</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <div className="relative -mt-8 px-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full bg-white dark:bg-gray-800"></div>
                  </div>
                </div>
              </div>
            ) : jobs.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {jobs.map((job, index) => (
                  <div 
                    key={job.id} 
                    className={`p-5 group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-300 ${
                      index === 0 ? 'rounded-t-xl' : ''
                    } ${index === jobs.length - 1 ? 'rounded-b-xl' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {job.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-medium">{job.company}</span>
                        </p>
                      </div>
                      <div className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-md">
                        {job.salary_range || 'Competitive'}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4 mb-4">
                      <span className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs px-3 py-1.5 rounded-full flex items-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location || 'Remote'}
                      </span>
                      <span className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs px-3 py-1.5 rounded-full flex items-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {job.job_type || 'Full-time'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Posted {formatDate(job.created_at)}
                      </span>
                      <Link href={`/jobs/${job.id}`}>
                        <Button className="rounded-lg text-sm px-4 py-2 h-auto bg-green-600 hover:bg-green-700 text-white shadow hover:shadow-lg transition-all">
                          View Details
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-4">
                <div className="inline-flex items-center justify-center p-5 rounded-full bg-green-50 dark:bg-green-900/20 mb-4 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-gray-700 dark:text-gray-300 mb-2 font-semibold text-lg">No job openings</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Check back later for new opportunities</p>
              </div>
            )}
          </CardContent>
        </div>
      </div>
      
      <CardFooter className="px-6 py-4 mt-3">
        <Link href="/jobs" className="w-full">
          <Button variant="outline" className="w-full rounded-lg bg-transparent border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 font-medium shadow-sm hover:shadow transition-all">
            Browse All Jobs
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}