'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Clock, HelpCircle } from 'lucide-react';
import VerificationRequestDialog from './VerificationRequestDialog';

interface VerificationStatusProps {
  userId: string;
  role: 'alumni' | 'mentor' | 'mentee';
}

export default function VerificationStatus({ userId, role }: VerificationStatusProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select(`alumni_verification_status, mentor_status, mentee_status`)
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const statusField = getStatusField();
      const statusValue = data[statusField as keyof typeof data];
      setStatus(statusValue ? String(statusValue) : null);
    } catch (err) {
      console.error('Error fetching verification status:', err);
      setError('Failed to fetch verification status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [userId, role]);

  const getStatusField = () => {
    if (role === 'alumni') return 'alumni_verification_status';
    if (role === 'mentor') return 'mentor_status';
    if (role === 'mentee') return 'mentee_status';
    return 'alumni_verification_status';
  };

  const getStatusBadge = () => {
    if (loading) return <Badge variant="outline">Loading...</Badge>;
    
    if (!status || status === 'not_verified') {
      return <Badge variant="outline" className="bg-gray-100">Not Verified</Badge>;
    }
    
    if (status === 'pending') {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending Verification</Badge>;
    }
    
    if (status === 'approved') {
      return <Badge variant="outline" className="bg-green-100 text-green-800">Verified</Badge>;
    }
    
    if (status === 'rejected') {
      return <Badge variant="outline" className="bg-red-100 text-red-800">Verification Rejected</Badge>;
    }
    
    return <Badge variant="outline">{status}</Badge>;
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
  };

  const handleVerificationSuccess = () => {
    fetchStatus();
  };

  const renderRequestButton = () => {
    if (loading) return null;
    
    if (!status || status === 'not_verified' || status === 'rejected') {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setDialogOpen(true)}
          className="ml-2"
        >
          Request Verification
        </Button>
      );
    }
    
    return null;
  };

  const getRoleName = () => {
    if (role === 'alumni') return 'Alumni';
    if (role === 'mentor') return 'Mentor';
    if (role === 'mentee') return 'Mentee';
    return 'Role';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{getRoleName()} Verification</CardTitle>
        <CardDescription>
          Verification status for your {getRoleName().toLowerCase()} role
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="py-2">{getStatusBadge()}</div>
        
        {status === 'rejected' && (
          <div className="mt-2 text-sm text-red-600">
            Your verification was rejected. Please submit a new verification request with valid documentation.
          </div>
        )}
        
        {renderRequestButton()}
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        {status === 'pending' && 'An administrator will review your verification shortly.'}
        {status === 'approved' && 'Your role has been verified. You now have full access.'}
      </CardFooter>
      
      <VerificationRequestDialog
        userId={userId}
        role={role}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        onSuccess={handleVerificationSuccess}
      />
    </Card>
  );
} 