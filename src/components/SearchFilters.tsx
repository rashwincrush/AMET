// src/components/SearchFilters.tsx
'use client';

import { ChangeEvent, useCallback, useMemo, useReducer, useEffect } from 'react';
import AdvancedSearchOptions from './AdvancedSearchOptions';
import { Button } from '@/components/ui/button';
import { FilterState, FilterAction, initialState, filterReducer } from './filterReducer';

type SearchFiltersProps = {
  graduationYears: (number | undefined)[];
  majors: (string | undefined)[];
  industries?: string[];
  locations?: string[];
  degrees?: string[];
  onFiltersChange: (filters: FilterState) => void;
};

export default function SearchFilters({
  graduationYears,
  majors,
  industries = [],
  locations = [],
  degrees = [],
  onFiltersChange,
}: SearchFiltersProps) {
  const [state, dispatch] = useReducer(filterReducer, initialState);
  
  // Memoize handlers to prevent unnecessary re-renders
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value });
  }, []);
  
  const handleYearFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : '';
    dispatch({ type: 'SET_GRADUATION_YEAR', payload: value });
  }, []);
  
  const handleMajorFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_MAJOR', payload: e.target.value });
  }, []);
  
  const handleIndustryFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_INDUSTRY', payload: e.target.value });
  }, []);
  
  const handleLocationFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_LOCATION', payload: e.target.value });
  }, []);
  
  const handleDegreeFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_DEGREE', payload: e.target.value });
  }, []);
  
  const handleVerifiedFilterChange = useCallback((checked: boolean) => {
    dispatch({ type: 'SET_VERIFIED', payload: checked });
  }, []);
  
  const handleMentorFilterChange = useCallback((checked: boolean) => {
    dispatch({ type: 'SET_MENTOR', payload: checked });
  }, []);
  
  const handleClearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);
  
  // Trigger parent callback when filters change
  useEffect(() => {
    onFiltersChange(state);
  }, [state, onFiltersChange]);
  
  // Memoize arrays to prevent unnecessary re-renders
  const uniqueGraduationYears = useMemo(() => {
    return Array.from(new Set(graduationYears.filter(Boolean)))
      .sort((a, b) => (b || 0) - (a || 0));
  }, [graduationYears]);
  
  const uniqueMajors = useMemo(() => {
    return Array.from(new Set(majors.filter(Boolean)))
      .sort((a, b) => (a || '').localeCompare(b || ''));
  }, [majors]);

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <input
            type="text"
            name="search"
            id="search"
            value={state.searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by name, company, position, or location"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            aria-label="Search alumni"
          />
        </div>

        <div>
          <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700">
            Graduation Year
          </label>
          <select
            id="graduationYear"
            name="graduationYear"
            value={state.graduationYearFilter}
            onChange={handleYearFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            aria-label="Filter by graduation year"
          >
            <option value="">All Years</option>
            {uniqueGraduationYears.map((year) => (
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
            value={state.majorFilter}
            onChange={handleMajorFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            aria-label="Filter by major"
          >
            <option value="">All Majors</option>
            {uniqueMajors.map((major) => (
              <option key={major} value={major}>
                {major}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <AdvancedSearchOptions
        industryFilter={state.industryFilter}
        locationFilter={state.locationFilter}
        degreeFilter={state.degreeFilter}
        isVerifiedFilter={state.isVerifiedFilter}
        isMentorFilter={state.isMentorFilter}
        graduationYearRangeFilter={state.graduationYearRangeFilter}
        joinedDateRangeFilter={state.joinedDateRangeFilter}
        industries={industries}
        locations={locations}
        degrees={degrees}
        onIndustryFilterChange={handleIndustryFilterChange}
        onLocationFilterChange={handleLocationFilterChange}
        onDegreeFilterChange={handleDegreeFilterChange}
        onVerifiedFilterChange={handleVerifiedFilterChange}
        onMentorFilterChange={handleMentorFilterChange}
        onGraduationYearRangeFilterChange={handleGraduationYearRangeFilterChange}
        onJoinedDateRangeFilterChange={handleJoinedDateRangeFilterChange}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}
