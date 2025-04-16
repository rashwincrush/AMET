"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { Download, Filter, X, Check } from 'lucide-react';
import { unparse } from 'papaparse';
import * as XLSX from 'xlsx';

interface CSVExportProps {
  entityType: 'users' | 'events' | 'jobs';
  buttonText?: string;
  className?: string;
  showIcon?: boolean;
}

export default function CSVExport({ 
  entityType, 
  buttonText = 'Export', 
  className = '', 
  showIcon = true 
}: CSVExportProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileFormat, setFileFormat] = useState<'csv' | 'excel'>('csv');
  
  // Filter states
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  // Define available filters for each entity type
  const availableFilters = {
    users: [
      { id: 'graduation_year', label: 'Graduation Year', type: 'text' },
      { id: 'is_mentor', label: 'Is Mentor', type: 'select', options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' }
      ]},
      { id: 'role', label: 'Role', type: 'select', options: [
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'admin', label: 'Admin' },
        { value: 'moderator', label: 'Moderator' },
        { value: 'event_manager', label: 'Event Manager' },
        { value: 'mentor', label: 'Mentor' },
        { value: 'alumni', label: 'Alumni' },
        { value: 'student', label: 'Student' }
      ]}
    ],
    events: [
      { id: 'event_type', label: 'Event Type', type: 'text' },
      { id: 'is_virtual', label: 'Virtual Event', type: 'select', options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' }
      ]},
      { id: 'start_date_after', label: 'Start Date After', type: 'date' },
      { id: 'start_date_before', label: 'Start Date Before', type: 'date' }
    ],
    jobs: [
      { id: 'job_type', label: 'Job Type', type: 'text' },
      { id: 'location', label: 'Location', type: 'text' },
      { id: 'is_active', label: 'Active Jobs', type: 'select', options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' }
      ]}
    ]
  };
  
  const handleFilterChange = (filterId: string, value: string) => {
    setFilters(prev => {
      if (!value) {
        const newFilters = { ...prev };
        delete newFilters[filterId];
        return newFilters;
      }
      return { ...prev, [filterId]: value };
    });
  };
  
  const resetFilters = () => {
    setFilters({});
  };
  
  const buildQueryString = () => {
    return Object.entries(filters)
      .filter(([_, value]) => value) // Filter out empty values
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  };
  
  const handleExport = async () => {
    try {
      setLoading(true);
      
      // Build query string from filters
      const queryString = buildQueryString();
      
      // Fetch data from API
      const response = await fetch(`/api/export/${entityType}${queryString ? `?${queryString}` : ''}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to export ${entityType}`);
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        toast.info('No data to export');
        return;
      }
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${entityType}_export_${timestamp}`;
      
      // Export based on selected format
      if (fileFormat === 'csv') {
        // Convert to CSV and download
        const csv = unparse(data);
        downloadFile(csv, `${filename}.csv`, 'text/csv');
      } else {
        // Convert to Excel and download
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, entityType);
        XLSX.writeFile(workbook, `${filename}.xlsx`);
      }
      
      toast.success(`Successfully exported ${data.length} ${entityType}`);
      setShowFilters(false);
    } catch (error: any) {
      toast.error(error.message || `Error exporting ${entityType}`);
    } finally {
      setLoading(false);
    }
  };
  
  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        disabled={loading}
      >
        {showIcon && <Download size={16} className="mr-2" />}
        {buttonText}
      </button>
      
      {showFilters && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Export Options</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">File Format</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  value="csv"
                  checked={fileFormat === 'csv'}
                  onChange={() => setFileFormat('csv')}
                />
                <span className="ml-2 text-sm text-gray-700">CSV</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  value="excel"
                  checked={fileFormat === 'excel'}
                  onChange={() => setFileFormat('excel')}
                />
                <span className="ml-2 text-sm text-gray-700">Excel</span>
              </label>
            </div>
          </div>
          
          {availableFilters[entityType].length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Filters</label>
                {Object.keys(filters).length > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Reset
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {availableFilters[entityType].map((filter) => (
                  <div key={filter.id}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {filter.label}
                    </label>
                    {filter.type === 'select' ? (
                      <select
                        value={filters[filter.id] || ''}
                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">All</option>
                        {filter.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : filter.type === 'date' ? (
                      <input
                        type="date"
                        value={filters[filter.id] || ''}
                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    ) : (
                      <input
                        type="text"
                        value={filters[filter.id] || ''}
                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                        placeholder={`Filter by ${filter.label.toLowerCase()}`}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </span>
            ) : (
              <span className="flex items-center">
                <Download size={16} className="mr-2" />
                Export {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
