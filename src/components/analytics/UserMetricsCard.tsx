'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpIcon, ArrowDownIcon, UsersIcon } from 'lucide-react';

interface UserMetrics {
  totalUsers: number;
  newUsersThisMonth: number;
  percentChange: number;
}

export default function UserMetricsCard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    percentChange: 0,
    isIncrease: true
  });
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchUserMetrics() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/analytics/users');
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError('You do not have permission to view this data');
          } else {
            setError('Failed to fetch user metrics');
          }
          return;
        }
        
        const data = await response.json();
        // Calculate if it's an increase or decrease
        const isIncrease = data.percentChange >= 0;
        
        setMetrics({
          ...data,
          isIncrease,
          percentChange: Math.abs(data.percentChange)
        });
      } catch (error) {
        console.error('Error fetching user metrics:', error);
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserMetrics();
  }, []);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">User Growth</CardTitle>
        <CardDescription>Total users and monthly growth</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-[120px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{metrics.totalUsers}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total registered users</p>
            
            <div className="mt-4 flex items-center">
              <div className="flex items-center">
                {metrics.isIncrease ? (
                  <ArrowUpIcon className="mr-1 h-4 w-4 text-emerald-500" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-4 w-4 text-rose-500" />
                )}
                <span className={`text-sm font-medium ${metrics.isIncrease ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {metrics.percentChange}%
                </span>
              </div>
              <span className="ml-1 text-xs text-muted-foreground">from last month</span>
            </div>
            <p className="mt-1 text-sm">{metrics.newUsersThisMonth} new users this month</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
