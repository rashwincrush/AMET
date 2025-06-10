'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, UsersIcon } from 'lucide-react';

interface EventMetrics {
  totalEvents: number;
  upcomingEvents: number;
  totalAttendees: number;
  averageAttendance: number;
}

export default function EventMetricsCard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalAttendees: 0,
    averageAttendance: 0
  });
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchEventMetrics() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/analytics/events');
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError('You do not have permission to view this data');
          } else {
            setError('Failed to fetch event metrics');
          }
          return;
        }
        
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching event metrics:', error);
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchEventMetrics();
  }, []);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Event Analytics</CardTitle>
        <CardDescription>Event participation and engagement</CardDescription>
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
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{metrics.totalEvents}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total events</p>
              <p className="mt-1 text-sm">{metrics.upcomingEvents} upcoming</p>
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{metrics.totalAttendees}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total attendees</p>
              <p className="mt-1 text-sm">~{metrics.averageAttendance} per event</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
