'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { toast } from 'sonner';

interface VerificationRequest {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  notes: string | null;
  profile: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function VerificationsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('pending');
  
  useEffect(() => {
    if (user) {
      fetchVerificationRequests();
    }
  }, [user]);
  
  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          id,
          user_id,
          document_type,
          document_url,
          status,
          submitted_at,
          reviewed_at,
          reviewed_by,
          notes,
          profile:profiles(
            first_name,
            last_name,
            email
          )
        `);
        
      if (error) throw error;
      
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      toast.error('Failed to load verification requests');
    } finally {
      setLoading(false);
    }
  };
  
  const renderVerificationStatus = (status: string) => {
    return (
      <TableCell>
        <Badge
          variant={
            status === 'approved'
              ? 'default'
              : status === 'rejected'
              ? 'destructive'
              : 'default'
          }
          className={cn(
            'flex items-center gap-1',
            status === 'approved' && 'bg-green-100 text-green-800',
            status === 'pending' && 'bg-yellow-100 text-yellow-800'
          )}
        >
          {status === 'approved' && <CheckCircle className="w-4 h-4" />}
          {status === 'rejected' && <XCircle className="w-4 h-4" />}
          {status === 'pending' && <Clock className="w-4 h-4" />}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </TableCell>
    );
  };
  
  const filteredRequests = requests.filter(request => 
    currentTab === 'all' || request.status === currentTab
  );
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>My Verification Requests</CardTitle>
            <CardDescription>
              Track the status of your alumni and mentor verification requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" onValueChange={setCurrentTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No {currentTab !== 'all' ? currentTab : ''} verification requests found.</p>
                  {currentTab === 'pending' && (
                    <Button variant="outline" className="mt-4">
                      Submit New Verification
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.document_type.replace('_', ' ')}</TableCell>
                        <TableCell>{new Date(request.submitted_at).toLocaleDateString()}</TableCell>
                        {renderVerificationStatus(request.status)}
                        <TableCell>
                          <Button variant="outline" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
} 