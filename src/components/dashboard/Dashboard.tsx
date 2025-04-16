'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Dashboard sections
import { UpcomingEventsCard } from './UpcomingEventsCard';
import { JobOpeningsCard } from './JobOpeningsCard';
import { MentorsCard } from './MentorsCard';
import { AMETAlumniStatsCard } from './AMETAlumniStatsCard';

export function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string>('AMET Alumni');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Function to emit auth state change event
  const emitAuthStateChangeEvent = (isAuthenticated: boolean) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('auth-state-changed', { 
        detail: { isLoggedIn: isAuthenticated } 
      });
      window.dispatchEvent(event);
      console.log('Emitted auth-state-changed event:', isAuthenticated);
    }
  };
  
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        
        console.log('Client-side auth check:', session ? 'User is logged in' : 'No active session');
        
        if (session?.user) {
          setIsLoggedIn(true);
          emitAuthStateChangeEvent(true);
          
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          setUserName(profile?.full_name || session.user.email?.split('@')[0] || 'AMET Alumni');
        } else {
          setIsLoggedIn(false);
          emitAuthStateChangeEvent(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
        emitAuthStateChangeEvent(false);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuthStatus();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsLoggedIn(true);
        emitAuthStateChangeEvent(true);
        // Get user profile after sign in
        const getUserProfile = async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          setUserName(profile?.full_name || session.user.email?.split('@')[0] || 'AMET Alumni');
        };
        getUserProfile();
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        emitAuthStateChangeEvent(false);
        setUserName('AMET Alumni');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-900 shadow-md"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    // If not logged in, redirect to home page
    router.push('/');
    return null;
  }

  // Dashboard content for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Enhanced Hero section with parallax-like effect */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9zdmc+')] bg-center"></div>
          </div>
        </div>
        <div className="relative pt-16 pb-20 px-6 sm:px-12 md:py-24 md:px-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">
                  <span className="block opacity-90">Welcome back,</span>
                  <span className="block text-white text-5xl md:text-6xl">{userName}!</span>
                </h1>
                <p className="text-blue-100 text-xl max-w-2xl leading-relaxed">
                  Stay connected with your AMET alumni network. Explore upcoming events, job opportunities, and connect with mentors.
                </p>
                <div className="flex space-x-4 pt-4">
                  <Link href="/events">
                    <Button className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 focus:ring-4 focus:ring-white/30 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base">
                      Browse Events
                    </Button>
                  </Link>
                  <Link href="/directory">
                    <Button variant="outline" className="px-6 py-3 bg-transparent border-2 border-white/70 text-white hover:bg-white/10 focus:ring-4 focus:ring-white/30 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base">
                      Alumni Directory
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute -top-6 -right-6 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-8 -left-8 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Alumni Network</h3>
                        <p className="text-blue-200 text-sm">Growing every day</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-white/90">Total Alumni</span>
                          <span className="font-bold text-white">2,547</span>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-white/90">New This Month</span>
                          <span className="font-bold text-white">+48</span>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-white/90">Active Members</span>
                          <span className="font-bold text-white">873</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="fill-gray-50 dark:fill-gray-900 h-12 w-full">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </div>
      
      {/* Dashboard Content with enhanced styling */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        {/* Quick actions bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl mb-10 p-1 transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex flex-wrap md:flex-nowrap">
            <Link href="/events/upcoming" className="flex-1 group p-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-colors">
              <div className="flex items-center justify-center md:justify-start space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Events</span>
              </div>
            </Link>
            <Link href="/jobs" className="flex-1 group p-4 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-xl transition-colors">
              <div className="flex items-center justify-center md:justify-start space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">Jobs</span>
              </div>
            </Link>
            <Link href="/mentors" className="flex-1 group p-4 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-xl transition-colors">
              <div className="flex items-center justify-center md:justify-start space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">Mentors</span>
              </div>
            </Link>
            <Link href="/directory" className="flex-1 group p-4 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-xl transition-colors">
              <div className="flex items-center justify-center md:justify-start space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">Directory</span>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Main dashboard grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <UpcomingEventsCard />
            <JobOpeningsCard />
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            <MentorsCard />
            <AMETAlumniStatsCard />
          </div>
        </div>
      </div>
    </div>
  );
}