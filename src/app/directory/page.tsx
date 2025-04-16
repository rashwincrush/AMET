'use client';

import { useState, useEffect, useCallback } from 'react';
import { profileService } from '@/lib/services/profileService';
import { Profile } from '@/types/database';
import ProfileCard from '@/components/directory/ProfileCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search as SearchIcon, 
  Filter as FilterIcon, 
  X as ClearIcon,
  ChevronDown as ChevronDownIcon,
  MapPin as LocationIcon,
  Briefcase as IndustryIcon,
  GraduationCap as EducationIcon,
  Calendar as YearIcon
} from 'lucide-react';
import PublicPageWrapper from '@/components/auth/PublicPageWrapper';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import _ from 'lodash';

// Add industry options
const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 
  'Manufacturing', 'Retail', 'Marketing', 'Consulting',
  'Entertainment', 'Government', 'Non-profit', 'Other'
];

// Add graduation year options (last 50 years)
const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

export default function DirectoryPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resultsCount, setResultsCount] = useState(0);
  const [activeFilters, setActiveFilters] = useState<{
    graduationYear: string | null;
    major: string | null;
    industry: string | null;
    location: string | null;
  }>({
    graduationYear: null,
    major: null,
    industry: null,
    location: null
  });
  
  // Derived state for active filters count
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;
  
  // Constants
  const PROFILES_PER_PAGE = 12;
  
  // Fetch profiles on component mount
  useEffect(() => {
    fetchProfiles();
  }, []);
  
  // Apply search and filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, activeFilters, profiles]);
  
  async function fetchProfiles() {
    try {
      setLoading(true);
      const data = await profileService.getAllProfiles();
      setProfiles(data);
      setFilteredProfiles(data);
      setResultsCount(data.length);
      setTotalPages(Math.ceil(data.length / PROFILES_PER_PAGE));
    } catch (err: any) {
      console.error('Error fetching profiles:', err);
      setError(err.message || 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }
  
  // Debounced search handler
  const debouncedSearch = useCallback(
    _.debounce((value: string) => {
      setSearchQuery(value);
      setCurrentPage(1); // Reset to first page on new search
    }, 300),
    []
  );
  
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };
  
  const applyFilters = async () => {
    try {
      setLoading(true);
      
      let results = [...profiles];
      
      // Apply text search if provided
      if (searchQuery.trim()) {
        try {
          // Try to use the API search first
          results = await profileService.searchProfiles(searchQuery);
        } catch (err) {
          // Fallback to client-side filtering if API fails
          results = profiles.filter(profile => {
            const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.toLowerCase();
            return fullName.includes(searchQuery.toLowerCase()) ||
              profile.email?.toLowerCase().includes(searchQuery.toLowerCase());
          });
        }
      }
      
      // Apply filters
      if (activeFilters.graduationYear) {
        results = results.filter(profile => 
          profile.graduation_year === parseInt(activeFilters.graduationYear, 10)
        );
      }
      
      if (activeFilters.major) {
        results = results.filter(profile => 
          profile.major === activeFilters.major
        );
      }
      
      if (activeFilters.industry) {
        results = results.filter(profile => 
          profile.industry === activeFilters.industry
        );
      }
      
      if (activeFilters.location) {
        results = results.filter(profile => 
          profile.location?.toLowerCase().includes(activeFilters.location.toLowerCase())
        );
      }
      
      setResultsCount(results.length);
      setTotalPages(Math.ceil(results.length / PROFILES_PER_PAGE));
      setFilteredProfiles(results);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (err: any) {
      console.error('Error applying filters:', err);
      setError(err.message || 'Failed to filter profiles');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (key: keyof typeof activeFilters, value: string | null) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const clearAllFilters = () => {
    setActiveFilters({
      graduationYear: null,
      major: null,
      industry: null,
      location: null
    });
    setSearchQuery('');
    debouncedSearch('');
  };
  
  const resetSearch = () => {
    setSearchQuery('');
    debouncedSearch('');
  };
  
  const clearSingleFilter = (key: keyof typeof activeFilters) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: null
    }));
  };
  
  // Get current page of profiles
  const getCurrentPageProfiles = () => {
    const startIndex = (currentPage - 1) * PROFILES_PER_PAGE;
    const endIndex = startIndex + PROFILES_PER_PAGE;
    return filteredProfiles.slice(startIndex, endIndex);
  };
  
  // Extract unique majors from profiles
  const uniqueMajors = Array.from(new Set(profiles.map(p => p.major).filter(Boolean))).sort();
  
  // Page navigation
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;
    
    const pageNumbers = [];
    // Show first, last, current, and 1 on each side of current
    const showFirst = currentPage > 2;
    const showLast = currentPage < totalPages - 1;
    const showPrevEllipsis = currentPage > 3;
    const showNextEllipsis = currentPage < totalPages - 2;
    
    if (showFirst) pageNumbers.push(1);
    if (showPrevEllipsis) pageNumbers.push('prev-ellipsis');
    
    // Pages around current
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbers.push(i);
    }
    
    if (showNextEllipsis) pageNumbers.push('next-ellipsis');
    if (showLast) pageNumbers.push(totalPages);
    
    return (
      <div className="flex justify-center mt-8 flex-wrap">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
          className="mx-1"
        >
          Previous
        </Button>
        
        {pageNumbers.map((page, index) => 
          typeof page === 'number' ? (
            <Button
              key={index}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => goToPage(page)}
              className="mx-1 min-w-[40px]"
            >
              {page}
            </Button>
          ) : (
            <span key={index} className="mx-1 flex items-center">...</span>
          )
        )}
        
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
          className="mx-1"
        >
          Next
        </Button>
      </div>
    );
  };
  
  // Active filters display component
  const ActiveFiltersDisplay = () => {
    if (activeFilterCount === 0 && !searchQuery) return null;
    
    return (
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500">Active filters:</span>
        
        {searchQuery && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Search: {searchQuery}
            <button onClick={resetSearch} className="ml-1 rounded-full">
              <ClearIcon size={14} />
            </button>
          </Badge>
        )}
        
        {activeFilters.graduationYear && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Year: {activeFilters.graduationYear}
            <button onClick={() => clearSingleFilter('graduationYear')} className="ml-1 rounded-full">
              <ClearIcon size={14} />
            </button>
          </Badge>
        )}
        
        {activeFilters.major && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Major: {activeFilters.major}
            <button onClick={() => clearSingleFilter('major')} className="ml-1 rounded-full">
              <ClearIcon size={14} />
            </button>
          </Badge>
        )}
        
        {activeFilters.industry && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Industry: {activeFilters.industry}
            <button onClick={() => clearSingleFilter('industry')} className="ml-1 rounded-full">
              <ClearIcon size={14} />
            </button>
          </Badge>
        )}
        
        {activeFilters.location && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Location: {activeFilters.location}
            <button onClick={() => clearSingleFilter('location')} className="ml-1 rounded-full">
              <ClearIcon size={14} />
            </button>
          </Badge>
        )}
        
        {(activeFilterCount > 0 || searchQuery) && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        )}
      </div>
    );
  };
  
  // Directory sidebar filters
  const DirectoryFilters = () => (
    <Card className="p-4 sticky top-4">
      <h2 className="font-semibold text-lg mb-4 flex items-center">
        <FilterIcon size={18} className="mr-2" />
        Filter Alumni
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium flex items-center mb-1">
            <YearIcon size={16} className="mr-1" />
            Graduation Year
          </label>
          <Select 
            value={activeFilters.graduationYear || ''} 
            onValueChange={(value) => handleFilterChange('graduationYear', value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_years">Any year</SelectItem>
              {YEARS.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium flex items-center mb-1">
            <EducationIcon size={16} className="mr-1" />
            Major
          </label>
          <Select 
            value={activeFilters.major || ''} 
            onValueChange={(value) => handleFilterChange('major', value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select major" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_majors">Any major</SelectItem>
              {uniqueMajors.map(major => (
                <SelectItem key={major} value={major}>
                  {major}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium flex items-center mb-1">
            <IndustryIcon size={16} className="mr-1" />
            Industry
          </label>
          <Select 
            value={activeFilters.industry || ''} 
            onValueChange={(value) => handleFilterChange('industry', value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_industries">Any industry</SelectItem>
              {INDUSTRIES.map(industry => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium flex items-center mb-1">
            <LocationIcon size={16} className="mr-1" />
            Location
          </label>
          <Input
            type="text"
            placeholder="Enter location"
            value={activeFilters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value || null)}
          />
        </div>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={clearAllFilters}
        >
          Clear Filters
        </Button>
      </div>
    </Card>
  );
  
  // Main content with results
  const DirectoryResults = () => {
    const currentProfiles = getCurrentPageProfiles();
    
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {resultsCount} {resultsCount === 1 ? 'Result' : 'Results'} Found
          </h2>
          
          <Select 
            value="relevance"
            onValueChange={() => {}}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by: Relevance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Sort by: Relevance</SelectItem>
              <SelectItem value="recent">Sort by: Recently Added</SelectItem>
              <SelectItem value="name">Sort by: Name (A-Z)</SelectItem>
              <SelectItem value="year-desc">Sort by: Year (Newest)</SelectItem>
              <SelectItem value="year-asc">Sort by: Year (Oldest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : currentProfiles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProfiles.map(profile => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
            <Pagination />
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium mb-2">No matching profiles found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search criteria or clear filters</p>
            <Button onClick={clearAllFilters}>Clear All Filters</Button>
          </div>
        )}
      </div>
    );
  };

  // Directory content component
  const DirectoryContent = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Alumni Directory</h1>
        
        <Button 
          variant="outline"
          className="flex items-center md:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FilterIcon size={16} className="mr-2" />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search by name, email, company or location..."
            defaultValue={searchQuery}
            onChange={handleSearchInput}
            className="pl-10"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={resetSearch}
            >
              <ClearIcon size={18} />
            </button>
          )}
        </div>
      </div>
      
      <ActiveFiltersDisplay />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className={`md:w-1/4 md:block ${showFilters ? 'block' : 'hidden'}`}>
          <DirectoryFilters />
        </div>
        
        <div className="md:w-3/4">
          <DirectoryResults />
        </div>
      </div>
    </div>
  );

  // Featured profiles preview for public view
  const ProfilesPreview = () => {
    // Use first 6 profiles for the preview
    const previewProfiles = profiles.slice(0, 6);
    
    // Tabs for different preview categories
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Alumni Network Preview</h2>
        
        <Tabs defaultValue="featured">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="featured" className="flex-1">Featured Alumni</TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">Recent Graduates</TabsTrigger>
            <TabsTrigger value="international" className="flex-1">Global Network</TabsTrigger>
          </TabsList>
          
          <TabsContent value="featured">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : previewProfiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {previewProfiles.map(profile => (
                  <ProfileCard key={profile.id} profile={profile} isPreview={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No profiles available for preview.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Sign in to view recent graduates</h3>
              <p className="text-gray-500 mb-4">Access our full directory to connect with recent alumni</p>
            </div>
          </TabsContent>
          
          <TabsContent value="international">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Global alumni network</h3>
              <p className="text-gray-500 mb-4">Our alumni are working in over 120 countries</p>
              <div className="flex justify-center gap-4 flex-wrap mt-4">
                <Badge variant="outline">United States</Badge>
                <Badge variant="outline">United Kingdom</Badge>
                <Badge variant="outline">Canada</Badge>
                <Badge variant="outline">Australia</Badge>
                <Badge variant="outline">Germany</Badge>
                <Badge variant="outline">France</Badge>
                <Badge variant="outline">Japan</Badge>
                <Badge variant="outline">Singapore</Badge>
                <Badge variant="outline">+112 more</Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  return (
    <PublicPageWrapper
      title="Alumni Directory"
      description="Connect with thousands of alumni from around the world. Build your professional network and discover career opportunities."
      ctaText="Sign in or create an account to access the full alumni directory with detailed profiles and advanced search features."
      stats={[
        { value: "5,000+", label: "Alumni Profiles" },
        { value: "120+", label: "Countries" },
        { value: "500+", label: "Companies" },
        { value: "95%", label: "Career Success Rate" }
      ]}
      previewComponent={<ProfilesPreview />}
    >
      <DirectoryContent />
    </PublicPageWrapper>
  );
}