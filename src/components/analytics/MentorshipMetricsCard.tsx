'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserIcon, UsersIcon } from 'lucide-react';

interface MentorshipMetrics {
  totalMentors: number;
  totalMentees: number;
  activeRelationships: number;
  completedRelationships: number;
  averageDuration: number;
}

export default function MentorshipMetricsCard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalMentors: 0,
    totalMentees: 0,
    activeRelationships: 0,
    completedRelationships: 0,
    averageDuration: 0
  });
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchMentorshipMetrics() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/analytics/mentorship');
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError('You do not have permission to view this data');
          } else {
            setError('Failed to fetch mentorship metrics');
          }
          return;
        }
        
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching mentorship metrics:', error);
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMentorshipMetrics();
  }, []);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Mentorship Program</CardTitle>
        <CardDescription>Mentor-mentee relationship metrics</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-[120px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{metrics.totalMentors}</span>
                </div>
                <p className="text-xs text-muted-foreground">Total mentors</p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{metrics.totalMentees}</span>
                </div>
                <p className="text-xs text-muted-foreground">Total mentees</p>
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{metrics.activeRelationships}</span>
              </div>
              <p className="text-xs text-muted-foreground">Active mentorships</p>
              <div className="mt-2 flex items-center text-sm">
                <span>{metrics.completedRelationships} completed</span>
                <span className="mx-2">•</span>
                <span>{metrics.averageDuration} days avg. duration</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
