'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { assignDefaultRole } from '@/lib/roles/roleAssignment';
import { FaUserGraduate, FaChalkboardTeacher, FaUserFriends } from 'react-icons/fa';

export default function RoleSelectionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'alumni' | 'mentor' | 'mentee' | 'both' | null>(null);
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [verificationDocumentUrl, setVerificationDocumentUrl] = useState<string | null>(null);
  const [isAlumniSchool, setIsAlumniSchool] = useState(true);  // Default to true - user is from the school
  const [graduationYear, setGraduationYear] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [verificationDetails, setVerificationDetails] = useState<string>('');

  useEffect(() => {
    // If no user is authenticated, redirect to login
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Check if user has completed this step already
    async function checkUserProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role_setup_complete, is_mentor, is_mentee')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // If user has already completed role setup, redirect to appropriate page
        if (data?.role_setup_complete) {
          router.push('/profile/complete');
        }
      } catch (err) {
        console.error('Error checking user profile:', err);
      }
    }

    checkUserProfile();
  }, [user, router]);

  const handleRoleSelection = async () => {
    if (!selectedRole || !user) return;
    
    setLoading(true);
    setError(null);

    try {
      // Assign default alumni role
      await assignDefaultRole(user.id);

      // Update profile with selected mentorship role
      const updateData: any = {
        role_setup_complete: true,
        verification_document_url: verificationDocumentUrl,
        verification_notes: verificationDetails,
        graduation_year: graduationYear || null,
        student_id: studentId || null
      };
      
      if (selectedRole === 'mentor' || selectedRole === 'both') {
        updateData.is_mentor = true;
        updateData.mentor_status = 'pending';
      }
      
      if (selectedRole === 'mentee' || selectedRole === 'both') {
        updateData.is_mentee = true;
        updateData.mentee_status = 'pending';
      }
      
      // Always mark alumni verification as pending until approved
      updateData.alumni_verification_status = 'pending';
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (updateError) throw updateError;

      // Redirect to appropriate page based on role
      if (selectedRole === 'mentor') {
        router.push('/mentorship/become-mentor');
      } else if (selectedRole === 'mentee') {
        router.push('/mentorship/become-mentee');
      } else if (selectedRole === 'both') {
        router.push('/mentorship/become-mentor?become_mentee=true');
      } else {
        // Just alumni
        router.push('/profile/complete');
      }
    } catch (err: any) {
      console.error('Error setting user role:', err);
      setError(err.message || 'Failed to set role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    try {
      setUploadingDocument(true);
      
      const file = e.target.files[0];
      setVerificationDocument(file);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-verification-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `verification-documents/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
        
      if (urlData) {
        setVerificationDocumentUrl(urlData.publicUrl);
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload verification document. Please try again.');
    } finally {
      setUploadingDocument(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome to the Alumni Network</h1>
          <p className="mt-2 text-gray-600">
            Please select how you'd like to participate in our community
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div 
            className="cursor-pointer"
            onClick={() => setSelectedRole('alumni')}
          >
            <Card 
              className={`h-full hover:shadow-md transition-shadow ${selectedRole === 'alumni' ? 'ring-2 ring-blue-500' : ''}`}
            >
              <CardHeader className="text-center">
                <FaUserGraduate className="h-12 w-12 mx-auto text-gray-700" />
                <CardTitle className="mt-4">Alumni</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Connect with fellow alumni, view events, and access job opportunities.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div 
            className="cursor-pointer"
            onClick={() => setSelectedRole('mentor')}
          >
            <Card 
              className={`h-full hover:shadow-md transition-shadow ${selectedRole === 'mentor' ? 'ring-2 ring-blue-500' : ''}`}
            >
              <CardHeader className="text-center">
                <FaChalkboardTeacher className="h-12 w-12 mx-auto text-gray-700" />
                <CardTitle className="mt-4">Mentor</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Share your knowledge and experience by becoming a mentor to other alumni.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div 
            className="cursor-pointer"
            onClick={() => setSelectedRole('mentee')}
          >
            <Card 
              className={`h-full hover:shadow-md transition-shadow ${selectedRole === 'mentee' ? 'ring-2 ring-blue-500' : ''}`}
            >
              <CardHeader className="text-center">
                <FaUserFriends className="h-12 w-12 mx-auto text-gray-700" />
                <CardTitle className="mt-4">Mentee</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Get guidance and support from experienced alumni in your field of interest.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center">
            <input
              id="both-roles"
              name="both-roles"
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              checked={selectedRole === 'both'}
              onChange={() => setSelectedRole(selectedRole === 'both' ? null : 'both')}
            />
            <label htmlFor="both-roles" className="ml-2 block text-sm text-gray-900">
              I want to be both a mentor and a mentee
            </label>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Information</h3>
          <p className="text-sm text-gray-600 mb-4">
            To ensure our community remains trusted, we require verification of your alumni status and role. 
            Please provide the following information:
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="student-id" className="block text-sm font-medium text-gray-700">
                Student ID
              </label>
              <input
                id="student-id"
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Your student ID from your time at the institution"
              />
            </div>

            <div>
              <label htmlFor="graduation-year" className="block text-sm font-medium text-gray-700">
                Graduation Year
              </label>
              <select
                id="graduation-year"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
              >
                <option value="">Select a year</option>
                {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="verification-document" className="block text-sm font-medium text-gray-700">
                Verification Document
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  id="verification-document"
                  className="sr-only"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocumentUpload}
                  disabled={uploadingDocument}
                />
                <label
                  htmlFor="verification-document"
                  className="relative cursor-pointer rounded-md bg-white py-2 px-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  {uploadingDocument ? 'Uploading...' : 'Upload document'}
                </label>
                {verificationDocument && (
                  <span className="ml-3 text-sm text-gray-500">
                    {verificationDocument.name}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Please upload a document that proves your identity and affiliation (diploma, transcript, etc.)
              </p>
            </div>

            <div>
              <label htmlFor="verification-details" className="block text-sm font-medium text-gray-700">
                Additional Information
              </label>
              <textarea
                id="verification-details"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={verificationDetails}
                onChange={(e) => setVerificationDetails(e.target.value)}
                placeholder="Add any additional information that might help verify your identity and role"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleRoleSelection}
            disabled={loading || !selectedRole}
            className="w-full sm:w-auto"
          >
            {loading ? 'Processing...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
} 