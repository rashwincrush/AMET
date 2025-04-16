'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import PublicPageWrapper from '@/components/auth/PublicPageWrapper';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

type Mentor = {
  id: string;
  first_name?: string;
  last_name?: string;
  graduation_year?: number;
  current_position?: string;
  current_company?: string;
  mentor_topics?: string;
  avatar_url?: string;
  bio?: string;
  industry?: string;
};

export default function MentorshipPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('');
  
  useEffect(() => {
    async function loadMentors() {
      try {
        setLoading(true);
        setError(null);
        
        // Get user profile to check if they're a mentor
        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (!profileError && profileData) {
            setUserProfile(profileData);
          }
        }
        
        // Get all mentors
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, graduation_year, current_position, current_company, mentor_topics, avatar_url, bio, industry')
          .eq('is_mentor', true)
          .order('last_name', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          setMentors(data as Mentor[]);
        }
      } catch (err: any) {
        console.error('Error loading mentors:', err);
        setError(err.message || 'Failed to load mentors');
      } finally {
        setLoading(false);
      }
    }
    
    loadMentors();
  }, [user]);
  
  // Filter mentors based on search and filters
  const filteredMentors = mentors.filter(mentor => {
    const fullName = `${mentor.first_name || ''} ${mentor.last_name || ''}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      (mentor.current_position?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (mentor.current_company?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (mentor.mentor_topics?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
    const matchesIndustry = !industryFilter || mentor.industry === industryFilter;
    
    return matchesSearch && matchesIndustry;
  });
  
  // Get unique industries for filter
  const industriesSet = new Set<string>();
  mentors.forEach(mentor => {
    if (mentor.industry) {
      industriesSet.add(mentor.industry);
    }
  });
  const industries = Array.from(industriesSet);
  
  return (
    <PublicPageWrapper
      title="AMET Alumni Mentorship Program"
      description="Connect with experienced mentors from the AMET Alumni community for career guidance and professional development."
      ctaText="Sign in to access all mentorship features, become a mentor, or request mentorship."
      previewComponent={
        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-md bg-white">
          <img 
            src="/images/mentorship-preview.jpg" 
            alt="Mentorship Program" 
            className="w-full h-48 object-cover object-center" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/800x400?text=AMET+Alumni+Mentorship';
            }}
          />
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Grow with Guidance</h3>
            <p className="text-sm text-gray-600">Our mentorship program connects you with industry professionals who can help guide your career journey.</p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Mentorship Program
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Connect with alumni mentors for career guidance and professional development.
            </p>
            <Link href="/mentorship/program" className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800">
              <span>How does the mentorship program work?</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Link href="/mentorship/program">
              <Button variant="outline" className="mr-2 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 border-blue-200">
                Program Info
              </Button>
            </Link>
            {userProfile?.is_mentor ? (
              <Link href="/mentorship/mentees">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  View My Mentees
                </Button>
              </Link>
            ) : (
              <Link href="/mentorship/become-mentor">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Become a Mentor
                </Button>
              </Link>
            )}
            {userProfile?.is_mentee ? (
              <Link href="/mentorship/my-mentors">
                <Button variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 border-blue-200">
                  My Mentors
                </Button>
              </Link>
            ) : (
              <Link href="/mentorship/become-mentee">
                <Button variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 border-blue-200">
                  Become a Mentee
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader>
              <CardTitle>Find a Mentor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Browse our directory of experienced alumni mentors ready to help you grow professionally.</p>
            </CardContent>
            <CardFooter>
              <Link href="/mentorship/mentors">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Browse Mentors
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Smart Mentor Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Get matched with the perfect mentor based on your goals, interests, and preferences.</p>
            </CardContent>
            <CardFooter>
              <Link href="/mentorship/mentor-matching">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Find My Match
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Become a Mentor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Share your expertise and experience with fellow alumni. Make a difference in someone's career.</p>
            </CardContent>
            <CardFooter>
              <Link href="/mentorship/become-mentor">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Offer Mentorship
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Get Mentorship</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Register as a mentee to be matched with experienced alumni in your field of interest.</p>
            </CardContent>
            <CardFooter>
              <Link href="/mentorship/become-mentee">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Request Mentorship
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        {/* Featured Mentors Heading */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Featured Mentors</h2>
          <Link href="/mentorship/mentors" className="text-blue-600 hover:text-blue-800 text-sm">
            View all mentors →
          </Link>
        </div>
        
        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search Mentors
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search by name, position, company, or topics"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Industry Filter */}
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Industry
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Industries</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mentors List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No mentors found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || industryFilter
                ? 'Try adjusting your search filters'
                : 'No mentors have registered yet'}
            </p>
            <div className="mt-6">
              <Link href="/mentorship/become-mentor">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Become the First Mentor
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMentors.map((mentor) => (
              <div key={mentor.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16">
                      {mentor.avatar_url ? (
                        <img
                          className="h-16 w-16 rounded-full"
                          src={mentor.avatar_url}
                          alt=""
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {mentor.first_name} {mentor.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {mentor.current_position} {mentor.current_company ? `at ${mentor.current_company}` : ''}
                      </p>
                      {mentor.graduation_year && (
                        <p className="text-sm text-gray-500">
                          Class of {mentor.graduation_year}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {mentor.mentor_topics && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900">Mentorship Topics</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {mentor.mentor_topics}
                      </p>
                    </div>
                  )}
                  
                  {mentor.bio && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900">About</h4>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-3">
                        {mentor.bio}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <Link href={`/directory/profiles/${mentor.id}`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicPageWrapper>
  );
}