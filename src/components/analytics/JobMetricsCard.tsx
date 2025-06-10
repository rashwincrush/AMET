'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BriefcaseIcon, FileTextIcon } from 'lucide-react';

interface JobMetrics {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  applicationRate: number;
}

export default function JobMetricsCard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    applicationRate: 0
  });
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchJobMetrics() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/analytics/jobs');
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError('You do not have permission to view this data');
          } else {
            setError('Failed to fetch job metrics');
          }
          return;
        }
        
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching job metrics:', error);
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchJobMetrics();
  }, []);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Job Portal Analytics</CardTitle>
        <CardDescription>Job listings and application metrics</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-[120px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{metrics.totalJobs}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total job listings</p>
              <p className="mt-1 text-sm">{metrics.activeJobs} currently active</p>
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{metrics.totalApplications}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total applications</p>
              <p className="mt-1 text-sm">{metrics.applicationRate} per job avg.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
