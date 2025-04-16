"use client";

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { parse } from 'papaparse';
import { toast } from 'sonner';
import { Upload, X, Check, AlertCircle, ArrowRight, Download } from 'lucide-react';

interface CSVImportProps {
  entityType: 'users' | 'events' | 'jobs';
  onComplete?: (results: any) => void;
}

export default function CSVImport({ entityType, onComplete }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'upload' | 'mapping' | 'validation' | 'importing' | 'complete'>('upload');
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [importResults, setImportResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Define the expected fields for each entity type
  const expectedFields = {
    users: [
      { field: 'email', required: true, description: 'User email address' },
      { field: 'first_name', required: true, description: 'User first name' },
      { field: 'last_name', required: true, description: 'User last name' },
      { field: 'graduation_year', required: false, description: 'Year of graduation' },
      { field: 'major', required: false, description: 'Field of study' },
      { field: 'company', required: false, description: 'Current company' },
      { field: 'job_title', required: false, description: 'Current job title' },
      { field: 'location', required: false, description: 'Current location' },
      { field: 'bio', required: false, description: 'User biography' },
      { field: 'skills', required: false, description: 'Comma-separated list of skills' },
      { field: 'is_mentor', required: false, description: 'Whether user is a mentor (TRUE/FALSE)' },
      { field: 'mentor_topics', required: false, description: 'Comma-separated list of mentorship topics' }
    ],
    events: [
      { field: 'title', required: true, description: 'Event title' },
      { field: 'description', required: true, description: 'Event description' },
      { field: 'start_date', required: true, description: 'Start date and time (YYYY-MM-DDTHH:MM:SS)' },
      { field: 'end_date', required: true, description: 'End date and time (YYYY-MM-DDTHH:MM:SS)' },
      { field: 'location', required: true, description: 'Event location or virtual platform' },
      { field: 'capacity', required: false, description: 'Maximum number of attendees' },
      { field: 'event_type', required: false, description: 'Type of event' },
      { field: 'is_virtual', required: false, description: 'Whether event is virtual (TRUE/FALSE)' },
      { field: 'registration_link', required: false, description: 'External registration link if any' },
      { field: 'organizer_name', required: false, description: 'Name of the organizer' },
      { field: 'organizer_email', required: false, description: 'Email of the organizer' }
    ],
    jobs: [
      { field: 'title', required: true, description: 'Job title' },
      { field: 'company_name', required: true, description: 'Company name' },
      { field: 'location', required: false, description: 'Job location' },
      { field: 'job_type', required: false, description: 'Type of job (Full-time, Part-time, etc.)' },
      { field: 'description', required: true, description: 'Job description' },
      { field: 'requirements', required: false, description: 'Job requirements' },
      { field: 'salary_range', required: false, description: 'Salary range' },
      { field: 'application_url', required: false, description: 'Application URL' },
      { field: 'contact_email', required: false, description: 'Contact email' },
      { field: 'expires_at', required: false, description: 'Expiration date (YYYY-MM-DD)' }
    ]
  };
  
  // Initialize mappings when headers change
  useEffect(() => {
    if (headers.length > 0) {
      const initialMappings: Record<string, string> = {};
      
      // Try to auto-map fields based on exact or similar names
      expectedFields[entityType].forEach(({ field }) => {
        // Check for exact match
        if (headers.includes(field)) {
          initialMappings[field] = field;
          return;
        }
        
        // Check for case-insensitive match
        const lowerField = field.toLowerCase();
        const match = headers.find(h => h.toLowerCase() === lowerField);
        if (match) {
          initialMappings[field] = match;
          return;
        }
        
        // Check for similar names (e.g., "first_name" vs "firstName")
        const normalizedField = field.replace(/[_-]/g, '').toLowerCase();
        const similarMatch = headers.find(h => {
          const normalizedHeader = h.replace(/[_-]/g, '').toLowerCase();
          return normalizedHeader === normalizedField;
        });
        
        if (similarMatch) {
          initialMappings[field] = similarMatch;
        }
      });
      
      setMappings(initialMappings);
    }
  }, [headers, entityType]);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      
      // Parse the CSV file
      parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setParsedData(results.data);
          setHeaders(results.meta.fields || []);
          setStep('mapping');
        },
        error: (error) => {
          toast.error(`Error parsing CSV: ${error.message}`);
        }
      });
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1
  });
  
  const handleMappingChange = (dbField: string, csvField: string) => {
    setMappings(prev => ({
      ...prev,
      [dbField]: csvField
    }));
  };
  
  const validateData = () => {
    const errors: any[] = [];
    
    // Get required fields
    const requiredFields = expectedFields[entityType]
      .filter(f => f.required)
      .map(f => f.field);
    
    // Check if all required fields are mapped
    const unmappedRequired = requiredFields.filter(field => !mappings[field]);
    if (unmappedRequired.length > 0) {
      toast.error(`Required fields not mapped: ${unmappedRequired.join(', ')}`);
      return false;
    }
    
    // Validate each row
    parsedData.forEach((row, index) => {
      const rowErrors: any = { row: index + 1, errors: [] };
      
      // Check required fields
      requiredFields.forEach(field => {
        const csvField = mappings[field];
        if (!row[csvField]) {
          rowErrors.errors.push(`Missing required field: ${field}`);
        }
      });
      
      // Validate email format for users
      if (entityType === 'users' && mappings.email) {
        const email = row[mappings.email];
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          rowErrors.errors.push('Invalid email format');
        }
      }
      
      // Validate date formats
      if (entityType === 'events') {
        ['start_date', 'end_date'].forEach(field => {
          if (mappings[field]) {
            const date = row[mappings[field]];
            if (date && isNaN(Date.parse(date))) {
              rowErrors.errors.push(`Invalid date format for ${field}`);
            }
          }
        });
      }
      
      if (entityType === 'jobs' && mappings.expires_at) {
        const date = row[mappings.expires_at];
        if (date && isNaN(Date.parse(date))) {
          rowErrors.errors.push('Invalid date format for expires_at');
        }
      }
      
      if (rowErrors.errors.length > 0) {
        errors.push(rowErrors);
      }
    });
    
    setValidationErrors(errors);
    return errors.length === 0;
  };
  
  const handleProceedToValidation = () => {
    const isValid = validateData();
    setStep('validation');
  };
  
  const handleImport = async () => {
    try {
      setLoading(true);
      setStep('importing');
      
      const response = await fetch(`/api/import/${entityType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [entityType]: parsedData,
          mappings
        })
      });
      
      const results = await response.json();
      
      if (!response.ok) {
        throw new Error(results.error || `Failed to import ${entityType}`);
      }
      
      setImportResults(results);
      setStep('complete');
      
      if (onComplete) {
        onComplete(results);
      }
      
      toast.success(`Successfully imported ${results.success} ${entityType}`);
    } catch (error: any) {
      toast.error(error.message || `Error importing ${entityType}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setHeaders([]);
    setMappings({});
    setValidationErrors([]);
    setImportResults(null);
    setStep('upload');
  };
  
  const downloadTemplate = () => {
    window.open(`/templates/${entityType}_template.csv`, '_blank');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {step === 'upload' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Import {entityType.charAt(0).toUpperCase() + entityType.slice(1)}</h2>
            <p className="text-gray-600 mb-4">
              Upload a CSV file to import {entityType}. Make sure your CSV has the required fields.
            </p>
            <button 
              onClick={downloadTemplate}
              className="text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto mb-6"
            >
              <Download size={16} className="mr-1" />
              Download template
            </button>
          </div>
          
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the file here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Drag & drop a CSV file here, or click to select</p>
                <p className="text-sm text-gray-500">Only CSV files are accepted</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {step === 'mapping' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Map CSV Fields</h2>
            <p className="text-gray-600 mb-4">
              Match the columns in your CSV file to the fields in our system.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">File: {file?.name}</p>
            <p className="text-sm text-gray-600">Total rows: {parsedData.length}</p>
          </div>
          
          <div className="space-y-4">
            {expectedFields[entityType].map(({ field, required, description }) => (
              <div key={field} className="flex items-center space-x-4">
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-gray-700">
                    {field} {required && <span className="text-red-500">*</span>}
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                  </label>
                </div>
                <div className="w-2/3">
                  <select
                    value={mappings[field] || ''}
                    onChange={(e) => handleMappingChange(field, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">-- Select CSV column --</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Back
            </button>
            <button
              onClick={handleProceedToValidation}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Validate Data
            </button>
          </div>
        </div>
      )}
      
      {step === 'validation' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Validate Data</h2>
            <p className="text-gray-600 mb-4">
              Review any validation issues before importing.
            </p>
          </div>
          
          {validationErrors.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex items-start">
                  <AlertCircle className="text-yellow-400 mr-3" />
                  <div>
                    <p className="text-sm text-yellow-700 font-medium">
                      Found {validationErrors.length} rows with validation issues
                    </p>
                    <p className="text-sm text-yellow-600 mt-1">
                      You can proceed with import, but rows with errors will be skipped.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {validationErrors.map((error, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{error.row}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <ul className="list-disc pl-5">
                            {error.errors.map((err: string, i: number) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex items-start">
                <Check className="text-green-400 mr-3" />
                <div>
                  <p className="text-sm text-green-700 font-medium">
                    All data is valid! Ready to import {parsedData.length} {entityType}.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setStep('mapping')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Back to Mapping
            </button>
            <button
              onClick={handleImport}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Importing...' : 'Import Data'}
            </button>
          </div>
        </div>
      )}
      
      {step === 'importing' && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Importing Data</h3>
          <p className="text-gray-600">This may take a moment...</p>
        </div>
      )}
      
      {step === 'complete' && importResults && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mx-auto mb-4">
              <Check size={32} />
            </div>
            <h2 className="text-xl font-semibold mb-2">Import Complete</h2>
          </div>
          
          <div className="bg-gray-50 rounded-md p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{importResults.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Successfully Imported</p>
                <p className="text-2xl font-bold text-green-600">{importResults.success}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Errors</p>
                <p className="text-2xl font-bold text-red-600">{importResults.errors.length}</p>
              </div>
            </div>
          </div>
          
          {importResults.errors.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Error Details</h3>
              <div className="max-h-64 overflow-y-auto border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {importResults.errors.map((error: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {error.row || 'Batch ' + error.batch}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{error.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="pt-4 flex justify-center">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Import More {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
