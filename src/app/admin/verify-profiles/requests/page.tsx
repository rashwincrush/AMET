'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

type VerificationRequest = {
  id: string;
  profile_id: string;
  reason: string;
  document_urls: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    graduation_year?: number;
  };
};

export default function VerificationRequestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  
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

        if (!data) {
          setIsAdmin(false);
          router.push('/');
          return;
        }

        setIsAdmin(true);
        await loadVerificationRequests();
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to verify permissions. Please try again.');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }
    
    checkAdminStatus();
  }, [user, router]);
  
  // Define loadVerificationRequests function outside useEffect for reuse
  async function loadVerificationRequests() {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('verification_requests')
        .select(`
          *,
          profile:profile_id (first_name, last_name, email, graduation_year)
        `)
        .order('created_at', { ascending: false });
        
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setRequests(data || []);
    } catch (err: any) {
      console.error('Error loading verification requests:', err);
      setError(err.message || 'Failed to load verification requests');
    } finally {
      setLoading(false);
    }
  }

  // Reload requests when status filter changes
  useEffect(() => {
    if (isAdmin) {
      loadVerificationRequests();
    }
  }, [statusFilter, isAdmin]);

  const handleApprove = async (requestId: string, profileId: string) => {
    try {
      if (!user || !isAdmin) return;
      
      setProcessingIds(prev => [...prev, requestId]);
      
      // Update verification request status
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);
        
      if (requestError) throw requestError;
      
      // Update profile verification status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', profileId);
        
      if (profileError) throw profileError;
      
      // Update local state
      setRequests(requests.map(request => 
        request.id === requestId ? { ...request, status: 'approved' } : request
      ));
      
      // In a real implementation, we would also send an email notification to the user
    } catch (err: any) {
      console.error('Error approving verification request:', err);
      alert('Failed to approve verification request. Please try again.');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };
  
  const handleReject = async (requestId: string) => {
    try {
      if (!user || !isAdmin) return;
      
      setProcessingIds(prev => [...prev, requestId]);
      
      const { error } = await supabase
        .from('verification_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
        
      if (error) throw error;
      
      // Update local state
      setRequests(requests.map(request => 
        request.id === requestId ? { ...request, status: 'rejected' } : request
      ));
      
      // In a real implementation, we would also send an email notification to the user
    } catch (err: any) {
      console.error('Error rejecting verification request:', err);
      alert('Failed to reject verification request. Please try again.');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>You do not have permission to access this page.</p>
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Return to Home
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verification Requests</h1>
          <p className="mt-2 text-sm text-gray-500">Review and process verification requests from alumni.</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <div>
            <select
              className="p-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <Link href="/admin/verify-profiles" className="text-blue-600 hover:text-blue-800">
              View All Profiles
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No verification requests found.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {requests.map((request) => (
                <li key={request.id} className="px-4 py-5 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {request.profile?.first_name} {request.profile?.last_name}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-500">{request.profile?.email}</p>
                      {request.profile?.graduation_year && (
                        <p className="text-sm text-gray-500">Graduation Year: {request.profile.graduation_year}</p>
                      )}
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleApprove(request.id, request.profile_id)}
                          disabled={processingIds.includes(request.id)}
                          className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                        >
                          {processingIds.includes(request.id) ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => handleReject(request.id)}
                          disabled={processingIds.includes(request.id)}
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          {processingIds.includes(request.id) ? 'Processing...' : 'Reject'}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">Reason for Verification:</h4>
                    <p className="mt-1 text-sm text-gray-500">{request.reason}</p>
                  </div>
                  
                  {request.document_urls && request.document_urls.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">Supporting Documents:</h4>
                      <ul className="mt-1 space-y-1">
                        {request.document_urls.map((url, index) => (
                          <li key={index}>
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Document {index + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mt-2 text-sm text-gray-500">
                    Submitted on {formatDate(request.created_at)}
                  </div>
                  
                  <div className="mt-2">
                    <Link 
                      href={`/profile/${request.profile_id}`} 
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Full Profile
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}