'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function MentorsCard() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMentors() {
      try {
        const { data, count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .eq('is_mentor', true)
          .limit(4);
        
        setMentors(data || []);
      } catch (error) {
        console.error('Error fetching mentors:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMentors();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-purple-500', 'bg-indigo-500', 'bg-pink-500', 
      'bg-violet-500', 'bg-fuchsia-500', 'bg-blue-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < name?.length || 0; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Card className="rounded-2xl overflow-hidden shadow-xl border-0 bg-white dark:bg-gray-800 transform transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 border-b-0 pb-12 relative">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="1" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div className="relative">
          <div className="flex items-center">
            <div className="mr-4 w-14 h-14 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-lg border border-white/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white mb-1">Available Mentors</CardTitle>
              <CardDescription className="text-purple-100 font-medium">Connect with experienced alumni</CardDescription>
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
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full bg-white dark:bg-gray-800"></div>
                  </div>
                </div>
              </div>
            ) : mentors.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {mentors.map((mentor) => (
                  <div 
                    key={mentor.id} 
                    className="group hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-xl border border-transparent 
                             hover:border-purple-200 dark:hover:border-purple-800 shadow transition-all duration-300 
                             hover:shadow-lg p-4 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`relative flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-white
                                     text-lg font-bold shadow-md group-hover:shadow-lg ${getAvatarColor(mentor.full_name)} 
                                     transition-all duration-300 transform group-hover:scale-105 border-2 border-white dark:border-gray-700`}>
                        {mentor.avatar_url ? (
                          <img 
                            src={mentor.avatar_url} 
                            alt={mentor.full_name} 
                            className="w-full h-full object-cover rounded-xl" 
                          />
                        ) : (
                          <span>{getInitials(mentor.full_name)}</span>
                        )}
                        <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-700"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-700 
                                 dark:group-hover:text-purple-400 transition-colors truncate">
                          {mentor.full_name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5 truncate">
                          {mentor.expertise || 'General Mentoring'}
                        </p>
                        <div className="mt-2 flex items-center">
                          <div className="flex -space-x-1 mr-2">
                            <div className="w-4 h-4 rounded-full bg-yellow-400 border border-white dark:border-gray-700"></div>
                            <div className="w-4 h-4 rounded-full bg-green-400 border border-white dark:border-gray-700"></div>
                            <div className="w-4 h-4 rounded-full bg-blue-400 border border-white dark:border-gray-700"></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {mentor.mentorship_count || Math.floor(Math.random() * 10) + 1} mentees
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-4">
                <div className="inline-flex items-center justify-center p-5 rounded-full bg-purple-50 dark:bg-purple-900/20 mb-4 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h4 className="text-gray-700 dark:text-gray-300 mb-2 font-semibold text-lg">No mentors available</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Be the first to offer mentorship</p>
              </div>
            )}
          </CardContent>
        </div>
      </div>
      
      <CardFooter className="px-6 py-4 mt-3">
        <div className="grid grid-cols-2 gap-4 w-full">
          <Link href="/mentors" className="w-full">
            <Button variant="outline" className="w-full rounded-lg bg-transparent border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium shadow-sm hover:shadow transition-all">
              Find Mentor
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>
          </Link>
          <Link href="/mentorship/become-mentor" className="w-full">
            <Button className="w-full rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all">
              Become Mentor
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}