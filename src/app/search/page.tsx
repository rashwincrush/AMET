"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { UserRound, MapPin, Briefcase, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdvancedSearch from '@/components/search/AdvancedSearch';
import { useAuth } from '@/lib/auth';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string;
  graduation_year: number;
  major: string;
  company: string;
  job_title: string;
  location: string;
  bio: string;
  is_mentor: boolean;
  roles: string[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Get search parameters
  const query = searchParams.get('q') || '';
  const graduationYears = searchParams.getAll('graduationYear');
  const majors = searchParams.getAll('major');
  const locations = searchParams.getAll('location');
  const roles = searchParams.getAll('role');
  const isMentor = searchParams.get('isMentor');
  const sortBy = searchParams.get('sortBy') || 'last_name';
  const sortOrder = searchParams.get('sortOrder') || 'asc';
  const currentPage = parseInt(searchParams.get('page') || '1');
  
  // Set current page from URL
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);
  
  // Search profiles
  useEffect(() => {
    async function searchProfiles() {
      try {
        setLoading(true);
        setError(null);
        
        // Build query string from search parameters
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        params.set('limit', '20');
        
        const response = await fetch(`/api/search/profiles?${params.toString()}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to search profiles');
        }
        
        const data = await response.json();
        setProfiles(data.data);
        setTotalCount(data.count);
        setTotalPages(data.totalPages);
      } catch (error: any) {
        console.error('Error searching profiles:', error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      searchProfiles();
    }
  }, [searchParams, page, user]);
  
  // Get highest role for a profile
  function getHighestRole(roles: string[]) {
    const roleHierarchy = ['super_admin', 'admin', 'moderator', 'event_manager', 'mentor', 'alumni', 'student'];
    
    for (const role of roleHierarchy) {
      if (roles.includes(role)) {
        return role;
      }
    }
    
    return 'student';
  }
  
  // Format role for display
  function formatRole(role: string) {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Handle pagination
  function handlePageChange(newPage: number) {
    // Update URL with new page parameter
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    
    // Update URL without refreshing the page
    window.history.pushState({}, '', `?${params.toString()}`);
    
    // Update state
    setPage(newPage);
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Alumni Directory</h1>
      
      <AdvancedSearch />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Search Summary */}
      <div className="mb-4">
        {query && (
          <p className="text-sm text-gray-600 mb-2">
            Search results for <span className="font-medium">"{query}"</span>
          </p>
        )}
        <p className="text-sm text-gray-600">
          Found <span className="font-medium">{totalCount}</span> {totalCount === 1 ? 'profile' : 'profiles'}
          {(graduationYears.length > 0 || majors.length > 0 || locations.length > 0 || 
            roles.length > 0 || isMentor !== null) && ' matching your filters'}
        </p>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Searching profiles...</p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <UserRound className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No profiles found</h3>
          <p className="text-gray-500 mb-4">
            {query ? `No profiles match "${query}"` : 'No profiles match your search criteria'}
          </p>
          <p className="text-gray-500">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map(profile => (
              <Card key={profile.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={`${profile.first_name} ${profile.last_name}`}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserRound className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        <Link href={`/profile/${profile.id}`} className="hover:underline">
                          {profile.first_name} {profile.last_name}
                        </Link>
                      </h3>
                      {profile.is_mentor && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          Mentor
                        </span>
                      )}
                      {profile.roles && profile.roles.length > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1 ml-1">
                          {formatRole(getHighestRole(profile.roles))}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {(profile.job_title || profile.company) && (
                      <div className="flex items-start">
                        <Briefcase className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                        <span className="text-sm text-gray-600">
                          {profile.job_title}{profile.job_title && profile.company ? ' at ' : ''}{profile.company}
                        </span>
                      </div>
                    )}
                    
                    {profile.graduation_year && (
                      <div className="flex items-start">
                        <GraduationCap className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                        <span className="text-sm text-gray-600">
                          Class of {profile.graduation_year}{profile.major ? `, ${profile.major}` : ''}
                        </span>
                      </div>
                    )}
                    
                    {profile.location && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                        <span className="text-sm text-gray-600">{profile.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {profile.bio && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <Link href={`/profile/${profile.id}`}>
                      <Button variant="outline" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <Button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                    .map((p, i, arr) => {
                      // Add ellipsis
                      if (i > 0 && p > arr[i - 1] + 1) {
                        return (
                          <span key={`ellipsis-${p}`} className="px-3 py-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      
                      return (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`px-3 py-2 rounded-md ${p === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          {p}
                        </button>
                      );
                    })}
                </div>
                
                <Button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
