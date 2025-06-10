'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthWithRoles } from '@/lib/useAuthWithRoles';
import { Loader2 } from 'lucide-react';

export default function TestDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthWithRoles();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple effect to simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[DashboardPage] No authenticated user, redirecting to login');
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Main dashboard render - simplified structure to test RSC issues
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.email?.split('@')[0] || 'Alumni'}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Test Dashboard</p>
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p>This is a test dashboard to validate React Server Component structure.</p>
        </div>
      </div>
    </div>
  );
}
