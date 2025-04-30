'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card } from './Card';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './CardComponents';
import { Button } from './Button';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import dashboard card components with proper typing
const DynamicUpcomingEventsCard = dynamic(() => import('@/components/dashboard/UpcomingEventsCard').then(mod => mod.UpcomingEventsCard), { ssr: false });
const DynamicJobOpeningsCard = dynamic(() => import('@/components/dashboard/JobOpeningsCard').then(mod => mod.JobOpeningsCard), { ssr: false });
const DynamicMentorsCard = dynamic(() => import('@/components/dashboard/MentorsCard').then(mod => mod.MentorsCard), { ssr: false });
const DynamicAlumniStatsCard = dynamic(() => import('@/components/dashboard/AlumniStatsCard').then(mod => mod.AlumniStatsCard), { ssr: false });

interface DashboardLoaderProps {
  fallback: React.ReactNode;
}

export function DashboardLoader({ fallback }: DashboardLoaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string>('Alumni');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        
        console.log('Client-side auth check:', session ? 'User is logged in' : 'No active session');
        
        if (session?.user) {
          setIsLoggedIn(true);
          
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          setUserName(profile?.full_name || session.user.email?.split('@')[0] || 'Alumni');
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <>{fallback}</>;
  }

  // Dashboard content for authenticated users
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero section with welcome message and gradient background */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white py-12 px-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Welcome back, {userName}!</h1>
          <p className="text-white/90 text-lg max-w-2xl">
            Stay connected with your alumni network. Explore upcoming events, job opportunities, and connect with mentors.
          </p>
        </div>
      </div>
      
      {/* Dashboard content with improved spacing and layout */}
      <div className="container mx-auto py-10 px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-10">
            <DynamicUpcomingEventsCard />
            <DynamicJobOpeningsCard />
          </div>
          
          {/* Right Column */}
          <div className="space-y-10">
            <DynamicMentorsCard />
            <DynamicAlumniStatsCard />
          </div>
        </div>
      </div>
    </div>
  );
}
