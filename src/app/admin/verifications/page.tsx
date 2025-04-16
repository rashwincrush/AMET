import { getStatusBadge } from './getStatusBadge';
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, XCircle, ExternalLink, Clock } from 'lucide-react';

interface VerificationRequest {
  id: string;
  user_id: string;
  created_at: string;
  alumni_verification_status: string;
  mentor_status: string;
  mentee_status: string;
  document_type: string;
  document_url: string;
  is_mentor: boolean;
  is_mentee: boolean;
  first_name: string;
  last_name: string;
  email: string;
  graduation_year: number;
  student_id: string;
  verification_document_url: string;
  verification_notes: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
  };
}

export default function AdminVerificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('alumni');
  const [statusFilter, setStatusFilter] = useState('pending');

  // Define getStatusBadge here to make it available in the component scope
  const getStatusBadge = (status: string) => {
    if (!status) return null;
    
    let badgeClass = '';
    let icon = null;
    
    if (status === 'approved' || status === 'verified') {
      badgeClass = 'bg-green-100 text-green-800';
      icon = <CheckCircle className="w-4 h-4" />;
    } else if (status === 'pending') {
      badgeClass = 'bg-yellow-100 text-yellow-800';
      icon = <Clock className="w-4 h-4" />;
    } else if (status === 'rejected') {
      badgeClass = 'bg-red-100 text-red-800';
      icon = <XCircle className="w-4 h-4" />;
    }
    
    return (
      <Badge
        variant="outline"
        className={`flex items-center gap-1 ${badgeClass}`}
      >
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchVerificationRequests();
    }
  }, [isAdmin, activeTab, statusFilter]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('profile_id', user.id)
        .eq('role_id', (await supabase.from('roles').select('id').eq('name', 'admin').single()).data?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsAdmin(!!data);
    } catch (err) {
      console.error('Error checking admin status:', err);
      setError('Failed to verify admin privileges');
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      
      let statusField = 'alumni_verification_status';
      if (activeTab === 'mentor') statusField = 'mentor_status';
      if (activeTab === 'mentee') statusField = 'mentee_status';
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq(statusField, statusFilter)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVerificationRequests(data || []);
    } catch (err) {
      console.error('Error fetching verification requests:', err);
      setError('Failed to load verification requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (verification: VerificationRequest) => {
    setSelectedVerification(verification);
    setReviewNotes('');
    setReviewDialogOpen(true);
  };

  const updateVerificationStatus = async (status: 'approved' | 'rejected') => {
    if (!selectedVerification || !user) return;

    try {
      setLoading(true);
      
      const updates: any = {
        verification_notes: reviewNotes,
        verification_reviewed_by: user.id,
        verification_reviewed_at: new Date().toISOString()
      };
      
      // Update the appropriate status field based on the active tab
      if (activeTab === 'alumni') {
        updates.alumni_verification_status = status;
      } else if (activeTab === 'mentor') {
        updates.mentor_status = status;
      } else if (activeTab === 'mentee') {
        updates.mentee_status = status;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', selectedVerification.id);

      if (error) throw error;

      toast.success(`Verification ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      setReviewDialogOpen(false);
      fetchVerificationRequests();
    } catch (err) {
      console.error('Error updating verification status:', err);
      toast.error('Failed to update verification status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  You do not have permission to access this page. Please contact an administrator if you believe this is an error.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Verification Requests</h1>
          <p className="text-gray-600">
            Review and approve verification requests from users
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="alumni" className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="alumni">Alumni Verification</TabsTrigger>
              <TabsTrigger value="mentor">Mentor Verification</TabsTrigger>
              <TabsTrigger value="mentee">Mentee Verification</TabsTrigger>
            </TabsList>

            <div className="flex space-x-2">
              <Button 
                variant={statusFilter === 'pending' ? 'default' : 'outline'} 
                onClick={() => setStatusFilter('pending')}
                size="sm"
              >
                Pending
              </Button>
              <Button 
                variant={statusFilter === 'approved' ? 'default' : 'outline'} 
                onClick={() => setStatusFilter('approved')}
                size="sm"
              >
                Approved
              </Button>
              <Button 
                variant={statusFilter === 'rejected' ? 'default' : 'outline'} 
                onClick={() => setStatusFilter('rejected')}
                size="sm"
              >
                Rejected
              </Button>
            </div>
          </div>

          <TabsContent value="alumni">
            <VerificationTable 
              requests={verificationRequests}
              statusField="alumni_verification_status"
              onReview={handleReview}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="mentor">
            <VerificationTable 
              requests={verificationRequests.filter(r => r.is_mentor)}
              statusField="mentor_status"
              onReview={handleReview}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="mentee">
            <VerificationTable 
              requests={verificationRequests.filter(r => r.is_mentee)}
              statusField="mentee_status"
              onReview={handleReview}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
        </Tabs>

        {selectedVerification && (
          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Review Verification Request</DialogTitle>
                <DialogDescription>
                  Verify the user's identity and eligibility for their requested role.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Name</div>
                  <div className="col-span-3">{selectedVerification.first_name} {selectedVerification.last_name}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Email</div>
                  <div className="col-span-3">{selectedVerification.email}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Graduation Year</div>
                  <div className="col-span-3">{selectedVerification.graduation_year || 'Not provided'}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Student ID</div>
                  <div className="col-span-3">{selectedVerification.student_id || 'Not provided'}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Verification Document</div>
                  <div className="col-span-3">
                    {selectedVerification.verification_document_url ? (
                      <a 
                        href={selectedVerification.verification_document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        View Document <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    ) : (
                      'No document provided'
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">User Notes</div>
                  <div className="col-span-3">{selectedVerification.verification_notes || 'No notes provided'}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Status</div>
                  <div className="col-span-3">
                    {activeTab === 'alumni' && getStatusBadge(selectedVerification.alumni_verification_status)}
                    {activeTab === 'mentor' && getStatusBadge(selectedVerification.mentor_status)}
                    {activeTab === 'mentee' && getStatusBadge(selectedVerification.mentee_status)}
                  </div>
                </div>

                <div>
                  <label htmlFor="review-notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Review Notes
                  </label>
                  <Textarea
                    id="review-notes"
                    placeholder="Add notes about your verification decision..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => updateVerificationStatus('rejected')}
                  disabled={loading}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button 
                  onClick={() => updateVerificationStatus('approved')}
                  disabled={loading}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ProtectedRoute>
  );
}

interface VerificationTableProps {
  requests: VerificationRequest[];
  statusField: 'alumni_verification_status' | 'mentor_status' | 'mentee_status';
  onReview: (request: VerificationRequest) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

function VerificationTable({ requests, statusField, onReview, getStatusBadge }: VerificationTableProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-gray-500">No verification requests found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Graduation Year</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((verification) => (
            <tr key={verification.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{verification.first_name} {verification.last_name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{verification.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{verification.graduation_year || 'Not provided'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(verification[statusField] as string)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {new Date(verification.created_at).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button variant="outline" size="sm" onClick={() => onReview(verification)}>
                  Review
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 