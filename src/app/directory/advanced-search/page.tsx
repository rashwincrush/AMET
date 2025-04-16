'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ProfileCard from '@/components/directory/ProfileCard';

type AlumniProfile = {
  id: string;
  first_name?: string;
  last_name?: string;
  graduation_year?: number;
  degree?: string;
  major?: string;
  current_company?: string;
  current_position?: string;
  location?: string;
  industry?: string;
  skills?: string[];
  interests?: string[];
  experience_level?: string;
  mentoring_availability?: string;
  is_verified?: boolean;
  is_mentor?: boolean;
};

export default function AdvancedSearchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Basic filters
  const [searchTerm, setSearchTerm] = useState('');
  const [graduationYearFilter, setGraduationYearFilter] = useState<number | ''>('');
  const [majorFilter, setMajorFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  
  // Advanced filters
  const [skillsFilter, setSkillsFilter] = useState<string[]>([]);
  const [experienceFilter, setExperienceFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [interestsFilter, setInterestsFilter] = useState<string[]>([]);

  useEffect(() => {
    async function loadProfiles() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, graduation_year, degree, major, current_company, current_position, location, industry, skills, interests, experience_level, mentoring_availability, is_verified, is_mentor')
          .order('last_name', { ascending: true });

        if (error) {
          throw error;
        }

        setProfiles(data || []);
      } catch (err: any) {
        console.error('Error loading profiles:', err);
        setError(err.message || 'Failed to load alumni directory');
      } finally {
        setLoading(false);
      }
    }

    loadProfiles();
  }, []);

  // Filter profiles based on all filters
  const filteredProfiles = profiles.filter(profile => {
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.toLowerCase();
    
    // Basic search filters
    const matchesSearch = searchTerm === '' || 
      fullName.includes(searchTerm.toLowerCase()) ||
      (profile.current_company && profile.current_company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (profile.current_position && profile.current_position.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (profile.location && profile.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesYear = graduationYearFilter === '' || profile.graduation_year === graduationYearFilter;
    
    const matchesMajor = majorFilter === '' || 
      (profile.major && profile.major.toLowerCase().includes(majorFilter.toLowerCase()));
    
    const matchesIndustry = industryFilter === '' || 
      (profile.industry && profile.industry.toLowerCase().includes(industryFilter.toLowerCase()));
    
    // Advanced filters
    const matchesSkills = skillsFilter.length === 0 ||
      (profile.skills && skillsFilter.every(skill => profile.skills?.includes(skill)));
    
    const matchesExperience = experienceFilter === '' ||
      (profile.experience_level && profile.experience_level === experienceFilter);
    
    const matchesAvailability = availabilityFilter === '' ||
      (profile.mentoring_availability && profile.mentoring_availability === availabilityFilter);
    
    const matchesInterests = interestsFilter.length === 0 ||
      (profile.interests && interestsFilter.some(interest => profile.interests?.includes(interest)));
    
    return matchesSearch && matchesYear && matchesMajor && matchesIndustry && 
           matchesSkills && matchesExperience && matchesAvailability && matchesInterests;
  });

  // Get unique values for filters
  const graduationYears = [...new Set(profiles
    .filter(p => p.graduation_year)
    .map(p => p.graduation_year))]
    .sort((a, b) => (b || 0) - (a || 0));

  const majors = [...new Set(profiles
    .filter(p => p.major)
    .map(p => p.major))]
    .sort();
    
  const industries = [...new Set(profiles
    .filter(p => p.industry)
    .map(p => p.industry))]
    .sort();
    
  // Get unique values for advanced filters
  const skills = [...new Set(profiles
    .flatMap(p => p.skills || []))]
    .sort();
    
  const experiences = [...new Set(profiles
    .filter(p => p.experience_level)
    .map(p => p.experience_level))]
    .sort();
    
  const availabilities = [...new Set(profiles
    .filter(p => p.mentoring_availability)
    .map(p => p.mentoring_availability))]
    .sort();
    
  const interests = [...new Set(profiles
    .flatMap(p => p.interests || []))]
    .sort();

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setGraduationYearFilter('');
    setMajorFilter('');
    setIndustryFilter('');
    setSkillsFilter([]);
    setExperienceFilter('');
    setAvailabilityFilter('');
    setInterestsFilter([]);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Alumni Search</h1>
          <p className="mt-2 text-sm text-gray-500">Find alumni with specific skills, experience, and interests.</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Search Filters</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                name="search"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, company, position, or location"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700">
                Graduation Year
              </label>
              <select
                id="graduationYear"
                name="graduationYear"
                value={graduationYearFilter}
                onChange={(e) => setGraduationYearFilter(e.target.value ? parseInt(e.target.value) : '')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Years</option>
                {graduationYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                Major
              </label>
              <select
                id="major"
                name="major"
                value={majorFilter}
                onChange={(e) => setMajorFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Majors</option>
                {majors.map((major) => (
                  <option key={major} value={major}>
                    {major}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                Industry
              </label>
              <select
                id="industry"
                name="industry"
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                Experience Level
              </label>
              <select
                id="experience"
                name="experience"
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Experience Levels</option>
                {experiences.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                Mentoring Availability
              </label>
              <select
                id="availability"
                name="availability"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Availabilities</option>
                {availabilities.map((avail) => (
                  <option key={avail} value={avail}>
                    {avail}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleClearFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-gray-700">
              {filteredProfiles.length} {filteredProfiles.length === 1 ? 'result' : 'results'} found
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-500">Loading alumni profiles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
            {filteredProfiles.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No alumni profiles found matching your search criteria.
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button onClick={() => router.push('/directory')} variant="outline">
            Back to Directory
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
} 