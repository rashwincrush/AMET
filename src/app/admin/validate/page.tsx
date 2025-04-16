"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/auth';

interface ValidationResult {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  errors: Array<{
    id: string;
    name?: string;
    title?: string;
    errors: string[];
  }>;
}

interface ValidationResults {
  profiles?: ValidationResult;
  events?: ValidationResult;
  jobs?: ValidationResult;
  achievements?: ValidationResult;
  [key: string]: ValidationResult | undefined;
}

export default function ValidatePage() {
  const { user } = useAuth();
  const [validationResults, setValidationResults] = useState<ValidationResults>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedTables, setSelectedTables] = useState<string[]>(['profiles', 'events', 'jobs', 'achievements']);
  
  const availableTables = [
    { name: 'profiles', label: 'User Profiles' },
    { name: 'events', label: 'Events' },
    { name: 'jobs', label: 'Jobs' },
    { name: 'achievements', label: 'Achievements' }
  ];
  
  useEffect(() => {
    if (user) {
      runValidation();
    }
  }, [user]);
  
  async function runValidation() {
    try {
      setLoading(true);
      setError(null);
      
      const tables = selectedTables.join(',');
      const response = await fetch(`/api/admin/validate?tables=${tables}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run validation');
      }
      
      const data = await response.json();
      setValidationResults(data.validationResults);
      
      // Auto-expand sections with errors
      const sectionsWithErrors: Record<string, boolean> = {};
      Object.entries(data.validationResults).forEach(([table, result]: [string, any]) => {
        if (result && typeof result === 'object' && 'invalidRecords' in result && result.invalidRecords > 0) {
          sectionsWithErrors[table] = true;
        }
      });
      setExpandedSections(sectionsWithErrors);
      
      toast.success('Validation completed');
    } catch (error: any) {
      console.error('Error running validation:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  
  function toggleSection(section: string) {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }
  
  function handleTableSelection(tableName: string) {
    setSelectedTables(prev => {
      if (prev.includes(tableName)) {
        return prev.filter(t => t !== tableName);
      } else {
        return [...prev, tableName];
      }
    });
  }
  
  function getStatusColor(result: ValidationResult) {
    if (!result) return 'bg-gray-100';
    if (result.invalidRecords === 0) return 'bg-green-50 border-green-200';
    if (result.invalidRecords < result.totalRecords / 5) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  }
  
  function getStatusIcon(result: ValidationResult) {
    if (!result) return null;
    if (result.invalidRecords === 0) return <CheckCircle className="text-green-500" size={20} />;
    if (result.invalidRecords < result.totalRecords / 5) return <AlertTriangle className="text-yellow-500" size={20} />;
    return <XCircle className="text-red-500" size={20} />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Data Validation</h1>
        <div className="flex space-x-2">
          <Button
            onClick={runValidation}
            className="bg-blue-600 hover:bg-blue-700 flex items-center"
            disabled={loading || selectedTables.length === 0}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Validating...' : 'Run Validation'}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Validation Settings</CardTitle>
          <CardDescription>
            Select the tables you want to validate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableTables.map(table => (
              <label key={table.name} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedTables.includes(table.name)}
                  onChange={() => handleTableSelection(table.name)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{table.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {loading && Object.keys(validationResults).length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Running validation checks...</p>
        </div>
      ) : Object.keys(validationResults).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No validation results</h3>
          <p className="text-gray-500 mb-4">Run validation to check your data integrity.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(validationResults).map(([table, result]) => {
            if (!result) return null;
            
            return (
              <Card key={table} className={`border ${getStatusColor(result)}`}>
                <CardHeader className="pb-2">
                  <div 
                    className="flex justify-between items-center cursor-pointer" 
                    onClick={() => toggleSection(table)}
                  >
                    <div className="flex items-center">
                      {getStatusIcon(result)}
                      <CardTitle className="ml-2">
                        {table.charAt(0).toUpperCase() + table.slice(1)}
                      </CardTitle>
                    </div>
                    <div className="flex items-center">
                      <div className="text-sm mr-4">
                        <span className="font-medium">{result.validRecords}</span> of <span className="font-medium">{result.totalRecords}</span> valid
                        {result.invalidRecords > 0 && (
                          <span className="ml-2 text-red-600">
                            ({result.invalidRecords} issues)
                          </span>
                        )}
                      </div>
                      {expandedSections[table] ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {expandedSections[table] && result.errors.length > 0 && (
                  <CardContent>
                    <div className="mt-2">
                      <h3 className="text-sm font-medium mb-2">Issues Found:</h3>
                      <div className="max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Item
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Issues
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {result.errors.map((error, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {error.name || error.title || `ID: ${error.id}`}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  <ul className="list-disc pl-5">
                                    {error.errors.map((err, i) => (
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
                  </CardContent>
                )}
                
                {expandedSections[table] && result.errors.length === 0 && (
                  <CardContent>
                    <div className="bg-green-50 p-4 rounded-md">
                      <div className="flex">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <p className="ml-3 text-sm text-green-700">
                          All {result.totalRecords} records are valid. No issues found.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
          
          <div className="flex justify-end">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="mr-2"
            >
              Print Report
            </Button>
            <Button
              onClick={runValidation}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Validating...' : 'Run Again'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
