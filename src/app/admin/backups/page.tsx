"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Database, Download, Trash, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/auth';

interface Backup {
  id: string;
  created_at: string;
  created_by: string;
  filename: string;
  file_size: number;
  tables: string[];
  record_counts: Record<string, number>;
  status: 'processing' | 'completed' | 'failed' | 'restoring' | 'restored';
  validation_results: any;
  notes: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export default function BackupsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const availableTables = [
    { name: 'profiles', label: 'User Profiles' },
    { name: 'user_roles', label: 'User Roles' },
    { name: 'events', label: 'Events' },
    { name: 'jobs', label: 'Jobs' },
    { name: 'achievements', label: 'Achievements' },
    { name: 'activity_logs', label: 'Activity Logs' }
  ];
  
  useEffect(() => {
    loadBackups();
  }, [page]);
  
  async function loadBackups() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/backups?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load backups');
      }
      
      const data = await response.json();
      setBackups(data.backups);
      setTotalCount(data.count);
    } catch (error: any) {
      console.error('Error loading backups:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  
  async function createBackup() {
    try {
      if (selectedTables.length === 0) {
        toast.error('Please select at least one table to backup');
        return;
      }
      
      setCreatingBackup(true);
      
      const response = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tables: selectedTables,
          notes: notes.trim() || undefined
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create backup');
      }
      
      const data = await response.json();
      toast.success('Backup initiated successfully');
      
      // Reset form
      setSelectedTables([]);
      setNotes('');
      setShowCreateForm(false);
      
      // Reload backups after a short delay
      setTimeout(() => {
        loadBackups();
      }, 2000);
    } catch (error: any) {
      console.error('Error creating backup:', error);
      toast.error(error.message);
    } finally {
      setCreatingBackup(false);
    }
  }
  
  async function deleteBackup(id: string) {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/backups/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete backup');
      }
      
      toast.success('Backup deleted successfully');
      loadBackups();
    } catch (error: any) {
      console.error('Error deleting backup:', error);
      toast.error(error.message);
    }
  }
  
  async function downloadBackup(id: string) {
    try {
      const response = await fetch(`/api/admin/backups/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get backup');
      }
      
      const data = await response.json();
      
      if (!data.downloadUrl) {
        throw new Error('Download URL not available');
      }
      
      // Open download URL in new tab
      window.open(data.downloadUrl, '_blank');
    } catch (error: any) {
      console.error('Error downloading backup:', error);
      toast.error(error.message);
    }
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
  
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }
  
  function formatFileSize(bytes: number) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'failed':
        return <XCircle className="text-red-500" size={18} />;
      case 'processing':
      case 'restoring':
        return <Clock className="text-yellow-500" size={18} />;
      case 'restored':
        return <CheckCircle className="text-blue-500" size={18} />;
      default:
        return null;
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Database Backups</h1>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'Create Backup'}
          </Button>
          <Button
            onClick={loadBackups}
            variant="outline"
            className="flex items-center"
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Backup</CardTitle>
            <CardDescription>
              Select the tables you want to include in the backup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Tables to Backup</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                  placeholder="Add notes about this backup"
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={createBackup}
                  disabled={creatingBackup || selectedTables.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {creatingBackup ? 'Creating...' : 'Create Backup'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {loading && backups.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading backups...</p>
        </div>
      ) : backups.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No backups found</h3>
          <p className="text-gray-500 mb-4">Create your first backup to protect your data.</p>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create Backup
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Backup
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Database className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {backup.filename}
                          </div>
                          <div className="text-sm text-gray-500">
                            {backup.tables.join(', ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {backup.profiles?.first_name} {backup.profiles?.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(backup.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {backup.file_size ? formatFileSize(backup.file_size) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(backup.status)}
                        <span className="ml-1.5 text-sm text-gray-900">
                          {backup.status.charAt(0).toUpperCase() + backup.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        {backup.status === 'completed' && (
                          <button
                            onClick={() => downloadBackup(backup.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Download size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteBackup(backup.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalCount > limit && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(page * limit, totalCount)}
                </span>{' '}
                of <span className="font-medium">{totalCount}</span> backups
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page * limit >= totalCount}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
