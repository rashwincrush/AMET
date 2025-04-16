'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AlertCircle, Upload } from 'lucide-react';

interface VerificationRequestDialogProps {
  userId: string;
  role: 'alumni' | 'mentor' | 'mentee';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function VerificationRequestDialog({
  userId,
  role,
  open,
  onOpenChange,
  onSuccess
}: VerificationRequestDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [graduationYear, setGraduationYear] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocument(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'alumni' && (!graduationYear || !studentId)) {
      setError('Please provide your graduation year and student ID');
      return;
    }
    
    if (!document) {
      setError('Please upload a verification document');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Upload document
      const fileExt = document.name.split('.').pop();
      const fileName = `${userId}-${role}-verification-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `verification-documents/${fileName}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, document);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
        
      if (!urlData) throw new Error('Failed to get document URL');
      
      // Determine which status field to update
      const updates: Record<string, any> = {
        verification_document_url: urlData.publicUrl,
        verification_notes: notes
      };
      
      if (graduationYear) {
        updates.graduation_year = parseInt(graduationYear);
      }
      
      if (studentId) {
        updates.student_id = studentId;
      }
      
      // Set the relevant status field to 'pending'
      if (role === 'alumni') {
        updates.alumni_verification_status = 'pending';
      } else if (role === 'mentor') {
        updates.mentor_status = 'pending';
      } else if (role === 'mentee') {
        updates.mentee_status = 'pending';
      }
      
      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      toast.success(`Verification request submitted successfully. An administrator will review it shortly.`);
      onOpenChange(false);
      onSuccess();
      
    } catch (err) {
      console.error('Error submitting verification request:', err);
      setError('Failed to submit verification request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = () => {
    if (role === 'alumni') return 'Alumni';
    if (role === 'mentor') return 'Mentor';
    if (role === 'mentee') return 'Mentee';
    return 'Role';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Request {getRoleName()} Verification</DialogTitle>
          <DialogDescription>
            Please provide necessary information to verify your {getRoleName().toLowerCase()} status.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {role === 'alumni' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="graduation-year">Graduation Year</Label>
                  <select
                    id="graduation-year"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="student-id">Student ID</Label>
                  <Input
                    id="student-id"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Your student ID"
                    required
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="verification-document">Verification Document</Label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                id="verification-document"
                className="sr-only"
                onChange={handleDocumentChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <label
                htmlFor="verification-document"
                className="relative cursor-pointer rounded-md bg-white py-2 px-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <span>Upload document</span>
                <Upload className="h-4 w-4 ml-2 inline" />
              </label>
              {document && (
                <span className="ml-3 text-sm text-gray-500">
                  {document.name}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Upload a document that verifies your {getRoleName().toLowerCase()} status (e.g., diploma, transcript, ID card, etc.)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information that might help with verification"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 