'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

type ActivityLog = {
  id: string;
  profile_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
};

export default function ActivityLogsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    action: '',
    entityType: '',
    userId: '',
    dateFrom: '',
    dateTo: ''
  });
  
  const PAGE_SIZE = 20;
  
  useEffect(() => {
    async function checkAdminStatus() {
      try {
        if (!user) return;

        // Check if user has admin role
        const { data, error } = await supabase
          .from('user_roles')
          .select('roles!inner(name)')
          .eq('profile_id', user.id)
          .eq('roles.name', 'admin')
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
          throw error;
        }

        setIsAdmin(!!data);

        if (!data) {
          setError('You do not have permission to access this page.');
          return;
        }

        await loadActivityLogs();
      } catch (err: any) {
        console.error('Error checking admin status:', err);
        setError('Failed to verify permissions. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    async function loadActivityLogs() {
      try {
        setLoading(true);
        setError(null);

        // Build query
        let query = supabase
          .from('activity_logs')
          .select(`
            *,
            profiles(full_name)
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

        // Apply filters
        if (filter.action) {
          query = query.eq('action', filter.action);
        }
        if (filter.entityType) {
          query = query.eq('entity_type', filter.entityType);
        }
        if (filter.userId) {
          query = query.eq('profile_id', filter.userId);
        }
        if (filter.dateFrom) {
          query = query.gte('created_at', filter.dateFrom);
        }
        if (filter.dateTo) {
          query = query.lte('created_at', filter.dateTo);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        // Format logs
        const formattedLogs = data.map((log: any) => ({
          id: log.id,
          profile_id: log.profile_id,
          user_name: log.profiles?.full_name || 'Unknown User',
          action: log.action,
          entity_type: log.entity_type,
          entity_id: log.entity_id,
          details: log.details,
          ip_address: log.ip_address,
          user_agent: log.user_agent,
          created_at: log.created_at
        }));

        setLogs(formattedLogs);
        setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
      } catch (err: any) {
        console.error('Error loading activity logs:', err);
        setError('Failed to load activity logs. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [user, page, filter]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filter changes
  };

  const handleClearFilters = () => {
    setFilter({
      action: '',
      entityType: '',
      userId: '',
      dateFrom: '',
      dateTo: ''
    });
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getEntityLink = (entityType: string, entityId: string) => {
    switch (entityType) {
      case 'profile':
        return `/profile/${entityId}`;
      case 'event':
        return `/events/${entityId}`;
      case 'job':
        return `/jobs/${entityId}`;
      case 'content':
        return `/admin/content/${entityId}`;
      default:
        return '#';
    }
  };

  if (!isAdmin && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          You do not have permission to access this page.
        </div>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Activity Logs</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              name="action"
              value={filter.action}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="view">View</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
            <select
              name="entityType"
              value={filter.entityType}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Entities</option>
              <option value="profile">Profile</option>
              <option value="event">Event</option>
              <option value="job">Job</option>
              <option value="content">Content</option>
              <option value="message">Message</option>
              <option value="group">Group</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              name="dateFrom"
              value={filter.dateFrom}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              name="dateTo"
              value={filter.dateTo}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleClearFilters} variant="outline" className="w-full">
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center py-8">
          <p className="text-gray-500">No activity logs found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Link href={`/profile/${log.profile_id}`} className="text-blue-600 hover:underline">
                          {log.user_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link href={getEntityLink(log.entity_type, log.entity_id)} className="text-blue-600 hover:underline">
                          {log.entity_type} #{log.entity_id.substring(0, 8)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {log.details ? JSON.stringify(log.details) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}