"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Search, Filter, X, Save, BookmarkCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from '@/lib/auth';

interface FilterOptions {
  graduationYears: number[];
  majors: string[];
  locations: string[];
  roles: { value: string; label: string }[];
}

interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, any>;
  created_at: string;
}

export default function AdvancedSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Search state
  const [query, setQuery] = useState('');
  const [selectedGraduationYears, setSelectedGraduationYears] = useState<string[]>([]);
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isMentor, setIsMentor] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState('last_name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  
  // Data state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    graduationYears: [],
    majors: [],
    locations: [],
    roles: []
  });
  const [loading, setLoading] = useState(false);
  
  // Initialize from URL params
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const years = searchParams.getAll('graduationYear');
    const majors = searchParams.getAll('major');
    const locations = searchParams.getAll('location');
    const roles = searchParams.getAll('role');
    const mentorParam = searchParams.get('isMentor');
    const sortByParam = searchParams.get('sortBy') || 'last_name';
    const sortOrderParam = searchParams.get('sortOrder') || 'asc';
    
    setQuery(q);
    setSelectedGraduationYears(years);
    setSelectedMajors(majors);
    setSelectedLocations(locations);
    setSelectedRoles(roles);
    setIsMentor(mentorParam === 'true' ? true : mentorParam === 'false' ? false : null);
    setSortBy(sortByParam);
    setSortOrder(sortOrderParam);
    
    // Show filters if any are selected
    if (years.length > 0 || majors.length > 0 || locations.length > 0 || roles.length > 0 || mentorParam !== null) {
      setShowFilters(true);
    }
  }, [searchParams]);
  
  // Load filter options
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const response = await fetch('/api/search/filters');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load filter options');
        }
        
        const data = await response.json();
        setFilterOptions(data);
      } catch (error: any) {
        console.error('Error loading filter options:', error);
        toast.error('Failed to load filter options');
      }
    }
    
    loadFilterOptions();
  }, []);
  
  // Load saved searches
  useEffect(() => {
    async function loadSavedSearches() {
      if (!user) return;
      
      try {
        const response = await fetch('/api/search/saved');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load saved searches');
        }
        
        const data = await response.json();
        setSavedSearches(data.savedSearches);
      } catch (error: any) {
        console.error('Error loading saved searches:', error);
      }
    }
    
    loadSavedSearches();
  }, [user]);
  
  // Build search URL
  const buildSearchUrl = useCallback(() => {
    const params = new URLSearchParams();
    
    if (query) params.append('q', query);
    
    selectedGraduationYears.forEach(year => {
      params.append('graduationYear', year);
    });
    
    selectedMajors.forEach(major => {
      params.append('major', major);
    });
    
    selectedLocations.forEach(location => {
      params.append('location', location);
    });
    
    selectedRoles.forEach(role => {
      params.append('role', role);
    });
    
    if (isMentor !== null) {
      params.append('isMentor', isMentor.toString());
    }
    
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    
    return `/search?${params.toString()}`;
  }, [query, selectedGraduationYears, selectedMajors, selectedLocations, selectedRoles, isMentor, sortBy, sortOrder]);
  
  // Handle search
  const handleSearch = () => {
    const url = buildSearchUrl();
    router.push(url);
  };
  
  // Handle filter toggle
  const toggleFilter = (type: string, value: string) => {
    switch (type) {
      case 'graduationYear':
        setSelectedGraduationYears(prev => 
          prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
        break;
      case 'major':
        setSelectedMajors(prev => 
          prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
        break;
      case 'location':
        setSelectedLocations(prev => 
          prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
        break;
      case 'role':
        setSelectedRoles(prev => 
          prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
        break;
    }
  };
  
  // Handle mentor filter
  const handleMentorFilter = (value: boolean | null) => {
    setIsMentor(prev => prev === value ? null : value);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedGraduationYears([]);
    setSelectedMajors([]);
    setSelectedLocations([]);
    setSelectedRoles([]);
    setIsMentor(null);
    setSortBy('last_name');
    setSortOrder('asc');
  };
  
  // Save current search
  const saveSearch = async () => {
    if (!searchName.trim()) {
      toast.error('Please enter a name for this search');
      return;
    }
    
    try {
      setLoading(true);
      
      const filters = {
        query,
        graduationYears: selectedGraduationYears,
        majors: selectedMajors,
        locations: selectedLocations,
        roles: selectedRoles,
        isMentor,
        sortBy,
        sortOrder
      };
      
      const response = await fetch('/api/search/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: searchName,
          filters
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save search');
      }
      
      const data = await response.json();
      setSavedSearches(prev => [data.savedSearch, ...prev]);
      setSearchName('');
      setShowSaveSearch(false);
      toast.success('Search saved successfully');
    } catch (error: any) {
      console.error('Error saving search:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete saved search
  const deleteSavedSearch = async (id: string) => {
    try {
      const response = await fetch(`/api/search/saved?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete saved search');
      }
      
      setSavedSearches(prev => prev.filter(search => search.id !== id));
      toast.success('Search deleted successfully');
    } catch (error: any) {
      console.error('Error deleting saved search:', error);
      toast.error(error.message);
    }
  };
  
  // Load saved search
  const loadSavedSearch = (search: SavedSearch) => {
    const { filters } = search;
    
    setQuery(filters.query || '');
    setSelectedGraduationYears(filters.graduationYears || []);
    setSelectedMajors(filters.majors || []);
    setSelectedLocations(filters.locations || []);
    setSelectedRoles(filters.roles || []);
    setIsMentor(filters.isMentor);
    setSortBy(filters.sortBy || 'last_name');
    setSortOrder(filters.sortOrder || 'asc');
    
    setShowFilters(true);
    setShowSavedSearches(false);
    
    // Update URL and trigger search
    setTimeout(() => {
      handleSearch();
    }, 0);
  };
  
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search alumni by name, company, job title..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center"
          >
            <Filter size={16} className="mr-2" />
            Filters
            {(selectedGraduationYears.length > 0 || selectedMajors.length > 0 || 
              selectedLocations.length > 0 || selectedRoles.length > 0 || 
              isMentor !== null) && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                {selectedGraduationYears.length + selectedMajors.length + 
                  selectedLocations.length + selectedRoles.length + 
                  (isMentor !== null ? 1 : 0)}
              </span>
            )}
          </Button>
          <Button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Search
          </Button>
        </div>
      </div>
      
      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowSavedSearches(!showSavedSearches)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <BookmarkCheck size={16} className="mr-1" />
            Saved Searches
            {showSavedSearches ? (
              <ChevronUp size={16} className="ml-1" />
            ) : (
              <ChevronDown size={16} className="ml-1" />
            )}
          </button>
          
          {showSavedSearches && (
            <div className="mt-2 p-4 bg-gray-50 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {savedSearches.map(search => (
                  <div key={search.id} className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50">
                    <button
                      onClick={() => loadSavedSearch(search)}
                      className="text-left flex-1 truncate"
                    >
                      {search.name}
                    </button>
                    <button
                      onClick={() => deleteSavedSearch(search.id)}
                      className="text-red-600 hover:text-red-800 ml-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Filters */}
      {showFilters && (
        <Card className="p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Filters</h3>
            <div className="flex space-x-2">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowSaveSearch(!showSaveSearch)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Save size={16} className="mr-1" />
                Save Search
              </button>
            </div>
          </div>
          
          {/* Save Search Form */}
          {showSaveSearch && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <div className="flex">
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Enter a name for this search"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <Button
                  onClick={saveSearch}
                  disabled={loading || !searchName.trim()}
                  className="rounded-l-none bg-blue-600 hover:bg-blue-700"
                >
                  Save
                </Button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Graduation Year Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Graduation Year</h4>
              <div className="max-h-40 overflow-y-auto">
                {filterOptions.graduationYears.map(year => (
                  <label key={year} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={selectedGraduationYears.includes(year.toString())}
                      onChange={() => toggleFilter('graduationYear', year.toString())}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm">{year}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Major Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Major</h4>
              <div className="max-h-40 overflow-y-auto">
                {filterOptions.majors.map(major => (
                  <label key={major} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={selectedMajors.includes(major)}
                      onChange={() => toggleFilter('major', major)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm">{major}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Location Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Location</h4>
              <div className="max-h-40 overflow-y-auto">
                {filterOptions.locations.map(location => (
                  <label key={location} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(location)}
                      onChange={() => toggleFilter('location', location)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm">{location}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Role and Mentor Filters */}
            <div>
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Role</h4>
                <div className="max-h-40 overflow-y-auto">
                  {filterOptions.roles.map(role => (
                    <label key={role.value} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.value)}
                        onChange={() => toggleFilter('role', role.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm">{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Mentor Status</h4>
                <div>
                  <label className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={isMentor === true}
                      onChange={() => handleMentorFilter(true)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm">Mentors Only</span>
                  </label>
                  <label className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={isMentor === false}
                      onChange={() => handleMentorFilter(false)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm">Non-Mentors Only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium mb-2">Sort By</h4>
            <div className="flex flex-wrap gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="last_name">Last Name</option>
                <option value="first_name">First Name</option>
                <option value="graduation_year">Graduation Year</option>
                <option value="location">Location</option>
                <option value="created_at">Join Date</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
          
          {/* Active Filters */}
          {(selectedGraduationYears.length > 0 || selectedMajors.length > 0 || 
            selectedLocations.length > 0 || selectedRoles.length > 0 || 
            isMentor !== null) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium mb-2">Active Filters</h4>
              <div className="flex flex-wrap gap-2">
                {selectedGraduationYears.map(year => (
                  <div key={year} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center">
                    Year: {year}
                    <button
                      onClick={() => toggleFilter('graduationYear', year)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {selectedMajors.map(major => (
                  <div key={major} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center">
                    Major: {major}
                    <button
                      onClick={() => toggleFilter('major', major)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {selectedLocations.map(location => (
                  <div key={location} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center">
                    Location: {location}
                    <button
                      onClick={() => toggleFilter('location', location)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {selectedRoles.map(role => (
                  <div key={role} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center">
                    Role: {role.replace('_', ' ')}
                    <button
                      onClick={() => toggleFilter('role', role)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {isMentor !== null && (
                  <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center">
                    {isMentor ? 'Mentors Only' : 'Non-Mentors Only'}
                    <button
                      onClick={() => setIsMentor(null)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
