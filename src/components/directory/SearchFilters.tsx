'use client';

import { ChangeEvent, useState } from 'react';
import { AdvancedSearchOptions } from './AdvancedSearchOptions';

type SearchFiltersProps = {
  searchTerm: string;
  graduationYearFilter: number | '';
  majorFilter: string;
  industryFilter?: string;
  locationFilter?: string;
  degreeFilter?: string;
  isVerifiedFilter?: boolean;
  isMentorFilter?: boolean;
  graduationYearRangeFilter?: [number | null, number | null];
  joinedDateRangeFilter?: [string | null, string | null];
  graduationYears: (number | undefined)[];
  majors: (string | undefined)[];
  industries?: string[];
  locations?: string[];
  degrees?: string[];
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onYearFilterChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onMajorFilterChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onIndustryFilterChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  onLocationFilterChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  onDegreeFilterChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  onVerifiedFilterChange?: (checked: boolean) => void;
  onMentorFilterChange?: (checked: boolean) => void;
  onGraduationYearRangeFilterChange?: (range: [number | null, number | null]) => void;
  onJoinedDateRangeFilterChange?: (range: [string | null, string | null]) => void;
  onClearFilters?: () => void;
};

export default function SearchFilters({
  searchTerm,
  graduationYearFilter,
  majorFilter,
  industryFilter = '',
  locationFilter = '',
  degreeFilter = '',
  isVerifiedFilter = false,
  isMentorFilter = false,
  graduationYearRangeFilter = [null, null],
  joinedDateRangeFilter = [null, null],
  graduationYears,
  majors,
  industries = [],
  locations = [],
  degrees = [],
  onSearchChange,
  onYearFilterChange,
  onMajorFilterChange,
  onIndustryFilterChange = () => {},
  onLocationFilterChange = () => {},
  onDegreeFilterChange = () => {},
  onVerifiedFilterChange = () => {},
  onMentorFilterChange = () => {},
  onGraduationYearRangeFilterChange = () => {},
  onJoinedDateRangeFilterChange = () => {},
  onClearFilters = () => {},
}: SearchFiltersProps) {
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
            value={searchTerm}
            onChange={onSearchChange}
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
            onChange={onYearFilterChange}
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
            onChange={onMajorFilterChange}
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
      </div>
      
      <AdvancedSearchOptions
        industryFilter={industryFilter}
        locationFilter={locationFilter}
        degreeFilter={degreeFilter}
        isVerifiedFilter={isVerifiedFilter}
        isMentorFilter={isMentorFilter}
        graduationYearRangeFilter={graduationYearRangeFilter}
        joinedDateRangeFilter={joinedDateRangeFilter}
        industries={industries}
        locations={locations}
        degrees={degrees}
        onIndustryFilterChange={onIndustryFilterChange}
        onLocationFilterChange={onLocationFilterChange}
        onDegreeFilterChange={onDegreeFilterChange}
        onVerifiedFilterChange={onVerifiedFilterChange}
        onMentorFilterChange={onMentorFilterChange}
        onGraduationYearRangeFilterChange={onGraduationYearRangeFilterChange}
        onJoinedDateRangeFilterChange={onJoinedDateRangeFilterChange}
        onClearFilters={onClearFilters}
      />
    </div>
  );
}