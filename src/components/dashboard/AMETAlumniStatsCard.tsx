'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AMETAlumniStatsCard() {
  const [stats, setStats] = useState<any>({
    totalAlumni: 0,
    newMembers: 0,
    activeMembers: 0,
    topIndustries: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch total alumni count
        const { count: totalAlumni } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' });

        // Fetch new members (last 30 days)
        const { count: newMembers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        // Fetch active members (last 7 days)
        const { count: activeMembers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .gte('last_sign_in', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
          
        // Get top industries
        const { data: industries } = await supabase
          .from('profiles')
          .select('industry')
          .not('industry', 'is', null)
          .limit(100);
          
        // Count occurrences of each industry
        const industryCounts: Record<string, number> = {};
        industries?.forEach((profile: any) => {
          if (profile.industry) {
            industryCounts[profile.industry] = (industryCounts[profile.industry] || 0) + 1;
          }
        });
        
        // Get top 3 industries
        const topIndustries = Object.entries(industryCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name, count]) => ({ name, count }));

        setStats({
          totalAlumni: totalAlumni || 0,
          newMembers: newMembers || 0,
          activeMembers: activeMembers || 0,
          topIndustries
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, []);

  return (
    <Card className="rounded-2xl overflow-hidden shadow-xl border-0 bg-white dark:bg-gray-800 transform transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 border-b-0 pb-12 relative">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill="url(#smallGrid)"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative">
          <div className="flex items-center">
            <div className="mr-4 w-14 h-14 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-lg border border-white/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white mb-1">Network Statistics</CardTitle>
              <CardDescription className="text-amber-100 font-medium">Insights from our AMET alumni community</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <div className="relative -mt-8 px-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <CardContent className="p-5">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full bg-white dark:bg-gray-800"></div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 text-center mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 
                               shadow hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group border border-amber-100 dark:border-amber-800/30">
                    <div className="flex items-center justify-center mb-2 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      {stats.totalAlumni.toLocaleString()}
                    </p>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Alumni</p>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 
                               shadow hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group border border-green-100 dark:border-green-800/30">
                    <div className="flex items-center justify-center mb-2 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                      {stats.newMembers.toLocaleString()}
                    </p>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">New This Month</p>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 
                               shadow hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-center justify-center mb-2 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                      {stats.activeMembers.toLocaleString()}
                    </p>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Active This Week</p>
                  </div>
                </div>
                
                {stats.topIndustries.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Top Industries
                    </h4>
                    <div className="space-y-3">
                      {stats.topIndustries.map((industry: any, index: number) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{industry.name}</span>
                            <span className="text-xs font-medium px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full shadow-sm">
                              {industry.count} AMET alumni
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
                            <div 
                              className="bg-amber-500 dark:bg-amber-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                              style={{ width: `${Math.min(100, (industry.count / (stats.totalAlumni || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </div>
      </div>
      
      <CardFooter className="px-6 py-4 mt-3">
        <div className="grid grid-cols-2 gap-4 w-full">
          <Link href="/directory" className="w-full">
            <Button variant="outline" className="w-full rounded-lg bg-transparent border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-medium shadow-sm hover:shadow transition-all">
              Browse Directory
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </Link>
          <Link href="/directory/advanced-search" className="w-full">
            <Button className="w-full rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-md hover:shadow-lg transition-all">
              Advanced Search
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}