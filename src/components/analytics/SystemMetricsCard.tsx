'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MailIcon, AlertTriangleIcon, BellIcon } from 'lucide-react';

interface SystemMetrics {
  emailsSent: {
    total: number;
    lastWeek: number;
  };
  jobAlerts: {
    total: number;
    matchRate: number;
  };
  systemErrors: {
    total: number;
    lastWeek: number;
  };
}

export default function SystemMetricsCard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    emailsSent: {
      total: 0,
      lastWeek: 0
    },
    jobAlerts: {
      total: 0,
      matchRate: 0
    },
    systemErrors: {
      total: 0,
      lastWeek: 0
    }
  });
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchSystemMetrics() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/analytics/system');
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError('You do not have permission to view this data');
          } else {
            setError('Failed to fetch system metrics');
          }
          return;
        }
        
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching system metrics:', error);
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSystemMetrics();
  }, []);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">System Health</CardTitle>
        <CardDescription>Email, alerts, and error metrics</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-[120px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <MailIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{metrics.emailsSent.total}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total emails sent</p>
              <p className="mt-1 text-sm">{metrics.emailsSent.lastWeek} this week</p>
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <BellIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{metrics.jobAlerts.total}</span>
              </div>
              <p className="text-xs text-muted-foreground">Job alerts sent</p>
              <p className="mt-1 text-sm">{metrics.jobAlerts.matchRate}% match rate</p>
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{metrics.systemErrors.total}</span>
              </div>
              <p className="text-xs text-muted-foreground">System errors</p>
              <p className="mt-1 text-sm">{metrics.systemErrors.lastWeek} this week</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
