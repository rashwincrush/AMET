"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CSVImport from "@/components/admin/CSVImport";
import CSVExport from "@/components/admin/CSVExport";
import { Database, Users, CalendarDays, Briefcase, Upload, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ImportExportPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'events' | 'jobs'>('users');
  const router = useRouter();
  
  const handleImportComplete = (results: any) => {
    // Optionally refresh data or navigate to another page
    console.log('Import completed:', results);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Data Import & Export</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-600" />
              Users
            </CardTitle>
            <CardDescription>Import and export user data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => {
                  setActiveTab('users');
                  document.getElementById('import-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                <Upload size={16} className="mr-1" />
                Import
              </button>
              <CSVExport 
                entityType="users" 
                buttonText="Export" 
                className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CalendarDays className="mr-2 h-5 w-5 text-blue-600" />
              Events
            </CardTitle>
            <CardDescription>Import and export event data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => {
                  setActiveTab('events');
                  document.getElementById('import-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                <Upload size={16} className="mr-1" />
                Import
              </button>
              <CSVExport 
                entityType="events" 
                buttonText="Export" 
                className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-blue-600" />
              Jobs
            </CardTitle>
            <CardDescription>Import and export job listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => {
                  setActiveTab('jobs');
                  document.getElementById('import-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                <Upload size={16} className="mr-1" />
                Import
              </button>
              <CSVExport 
                entityType="jobs" 
                buttonText="Export" 
                className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div id="import-section" className="mt-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="users" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center">
              <Briefcase className="mr-2 h-4 w-4" />
              Jobs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <CSVImport entityType="users" onComplete={handleImportComplete} />
          </TabsContent>
          
          <TabsContent value="events">
            <CSVImport entityType="events" onComplete={handleImportComplete} />
          </TabsContent>
          
          <TabsContent value="jobs">
            <CSVImport entityType="jobs" onComplete={handleImportComplete} />
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start">
          <Database className="text-blue-600 mr-3 mt-1" />
          <div>
            <h2 className="text-xl font-semibold">Data Management Guidelines</h2>
            <p className="text-gray-600 mb-4">
              Follow these guidelines when importing and exporting data.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">CSV Format Requirements</h3>
                <ul className="list-disc pl-5 text-gray-600 mt-1 space-y-1">
                  <li>Use UTF-8 encoding for all CSV files</li>
                  <li>First row must contain column headers</li>
                  <li>Dates should be in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)</li>
                  <li>Boolean values should be TRUE or FALSE (uppercase)</li>
                  <li>For fields with multiple values, use comma-separated text</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Data Privacy Considerations</h3>
                <ul className="list-disc pl-5 text-gray-600 mt-1 space-y-1">
                  <li>Ensure you have permission to import/export user data</li>
                  <li>Do not include sensitive personal information in exports</li>
                  <li>Store downloaded data securely and delete when no longer needed</li>
                  <li>Follow all applicable data protection regulations</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Templates</h3>
                <p className="text-gray-600 mt-1">
                  Download templates for each data type to ensure your import files are correctly formatted.
                  Templates are available on the import page for each data type.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
