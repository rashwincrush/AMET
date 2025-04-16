'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Upload, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ProfileVerification() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user has a pending verification request
  const checkVerificationStatus = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setExistingRequest(data);
        setVerificationStatus(data.status);
      }
    } catch (error: any) {
      console.error('Error checking verification status:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !documentType || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${documentType}-${Date.now()}.${fileExt}`;
    const filePath = `verification-documents/${fileName}`;
    
    try {
      setLoading(true);
      setError(null);
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      // Create verification request
      const { error: requestError } = await supabase
        .from('user_verification_requests')
        .insert({
          user_id: user.id,
          document_type: documentType,
          document_url: publicUrl,
          status: 'pending'
        });
      
      if (requestError) throw requestError;
      
      setSuccess('Verification document uploaded successfully. Our team will review it shortly.');
      setExistingRequest({
        document_type: documentType,
        document_url: publicUrl,
        status: 'pending',
        submitted_at: new Date().toISOString()
      });
      setVerificationStatus('pending');
      
      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading document:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center text-amber-600">
            <Clock className="h-4 w-4 mr-1" />
            <span>Pending Review</span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Verified</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center text-red-600">
            <XCircle className="h-4 w-4 mr-1" />
            <span>Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Profile Verification</CardTitle>
            <CardDescription>
              Verify your alumni status by uploading official documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            {verificationStatus && (
              <Alert className="mb-4">
                <AlertTitle>Verification Status</AlertTitle>
                <AlertDescription>
                  {getStatusBadge(verificationStatus)}
                </AlertDescription>
              </Alert>
            )}
            
            {verificationStatus === 'approved' ? (
              <div className="space-y-4">
                <p>Your profile has been verified. Thank you for providing your documents.</p>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/profile')}
                  className="w-full"
                >
                  Back to Profile
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document-type">Document Type</Label>
                  <Select
                    value={documentType}
                    onValueChange={setDocumentType}
                    disabled={loading || verificationStatus === 'pending'}
                  >
                    <SelectTrigger id="document-type">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="transcript">Academic Transcript</SelectItem>
                      <SelectItem value="student_id">Student ID Card</SelectItem>
                      <SelectItem value="graduation_certificate">Graduation Certificate</SelectItem>
                      <SelectItem value="other">Other Official Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="document-upload">Upload Document</Label>
                  <Input
                    id="document-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    disabled={loading || !documentType || verificationStatus === 'pending'}
                    ref={fileInputRef}
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: PDF, JPG, JPEG, PNG. Maximum size: 5MB.
                  </p>
                </div>
                
                {verificationStatus === 'rejected' && existingRequest?.notes && (
                  <Alert variant="destructive">
                    <AlertTitle>Rejection Reason</AlertTitle>
                    <AlertDescription>
                      {existingRequest.notes}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => router.push('/profile')}
              className="w-full"
            >
              Back to Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ProtectedRoute>
  );
} 