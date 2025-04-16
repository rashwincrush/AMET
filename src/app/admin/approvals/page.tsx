'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

type ApprovalRequest = {
  id: string;
  type: 'employer_access' | 'event_publication' | 'job_listing' | 'content_moderation';
  user_id: string;
  user_name: string;
  content_id?: string;
  content_title?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  notes?: string;
};

function ApprovalsPageClient() {
  const router = useRouter();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (roleError && roleError.code !== 'PGRST116') {
          throw roleError;
        }

        if (!roleData) {
          setIsAdmin(false);
          router.push('/');
          return;
        }

        setIsAdmin(true);
        loadApprovalRequests();
      } catch (err: any) {
        console.error('Error checking admin status:', err);
        setError(err.message || 'Failed to check admin status');
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [router]);

  const loadApprovalRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load approval requests with user information
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          *,
          profiles(first_name, last_name)
        `)
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRequests = data.map((request: any) => ({
        id: request.id,
        type: request.type,
        user_id: request.user_id,
        user_name: `${request.profiles.first_name} ${request.profiles.last_name}`,
        content_id: request.content_id,
        content_title: request.content_title,
        status: request.status,
        created_at: request.created_at,
        notes: request.notes
      }));

      setRequests(formattedRequests);
    } catch (err: any) {
      console.error('Error loading approval requests:', err);
      setError(err.message || 'Failed to load approval requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      
      // Update request status
      const { error: updateError } = await supabase
        .from('approval_requests')
        .update({ status: 'approved' })
        .eq('id', id);

      if (updateError) throw updateError;

      // Get the request details to handle the specific approval action
      const { data: requestData, error: requestError } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (requestError) throw requestError;

      // Handle different types of approvals
      if (requestData.type === 'employer_access') {
        // Grant employer role to the user
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: requestData.user_id,
            role: 'employer'
          });

        if (roleError) throw roleError;
      } else if (requestData.type === 'event_publication') {
        // Publish the event
        const { error: eventError } = await supabase
          .from('events')
          .update({ is_published: true })
          .eq('id', requestData.content_id);

        if (eventError) throw eventError;
      } else if (requestData.type === 'job_listing') {
        // Publish the job listing
        const { error: jobError } = await supabase
          .from('job_listings')
          .update({ is_published: true })
          .eq('id', requestData.content_id);

        if (jobError) throw jobError;
      }

      // Refresh the list
      loadApprovalRequests();
    } catch (err: any) {
      console.error('Error approving request:', err);
      alert('Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setProcessingId(id);
      
      // Update request status
      const { error } = await supabase
        .from('approval_requests')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;

      // Refresh the list
      loadApprovalRequests();
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      alert('Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewContent = (type: string, contentId?: string) => {
    if (!contentId) return;
    
    switch (type) {
      case 'event_publication':
        router.push(`/events/${contentId}`);
        break;
      case 'job_listing':
        router.push(`/jobs/${contentId}`);
        break;
      case 'content_moderation':
        router.push(`/admin/content/${contentId}`);
        break;
      default:
        break;
    }
  };

  const handleTabChange = (tab: 'pending' | 'approved' | 'rejected') => {
    setActiveTab(tab);
    loadApprovalRequests();
  };

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Approval Workflows</h1>
      <p className="mt-2 text-sm text-gray-600">
        Manage approval requests for various actions in the system.
      </p>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('pending')}
            className={`${activeTab === 'pending' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pending
          </button>
          <button
            onClick={() => handleTabChange('approved')}
            className={`${activeTab === 'approved' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Approved
          </button>
          <button
            onClick={() => handleTabChange('rejected')}
            className={`${activeTab === 'rejected' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Rejected
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading approval requests...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No {activeTab} approval requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.type === 'employer_access' ? 'bg-purple-100 text-purple-800' :
                          request.type === 'event_publication' ? 'bg-green-100 text-green-800' :
                          request.type === 'job_listing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.user_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.content_title ? (
                          <button
                            onClick={() => handleViewContent(request.type, request.content_id)}
                            className="text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            {request.content_title}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {activeTab === 'pending' ? (
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={() => handleApprove(request.id)}
                              variant="default"
                              className="text-xs py-1 px-2"
                              disabled={processingId === request.id}
                            >
                              {processingId === request.id ? 'Processing...' : 'Approve'}
                            </Button>
                            <Button
                              onClick={() => handleReject(request.id)}
                              variant="destructive"
                              className="text-xs py-1 px-2"
                              disabled={processingId === request.id}
                            >
                              {processingId === request.id ? 'Processing...' : 'Reject'}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            {activeTab === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApprovalsPage() {
  return <ApprovalsPageClient />;
}