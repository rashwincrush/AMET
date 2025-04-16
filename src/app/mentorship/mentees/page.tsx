'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Image from 'next/image';

export default function MenteesPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [menteeRequests, setMenteeRequests] = useState<any[]>([]);
  const [activeMentees, setActiveMentees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchMenteeData() {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get user profile to check if they're a mentor
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        if (!profileData.is_mentor) {
          router.push('/mentorship/become-mentor');
          return;
        }
        
        // Fetch all mentorship relationships where this user is the mentor
        const { data: relationshipsData, error: relationshipsError } = await supabase
          .from('mentorship_relationships')
          .select(`
            *,
            mentee:mentee_id(
              id,
              first_name,
              last_name,
              current_position,
              current_company,
              graduation_year,
              avatar_url,
              mentee_career_goals,
              mentee_mentorship_areas,
              mentee_skills_to_develop,
              mentee_time_commitment,
              email
            )
          `)
          .eq('mentor_id', user.id)
          .order('requested_at', { ascending: false });
          
        if (relationshipsError) throw relationshipsError;
        
        // Separate pending requests from active mentorships
        const pendingRequests = relationshipsData?.filter(rel => rel.status === 'pending') || [];
        const active = relationshipsData?.filter(rel => rel.status === 'active') || [];
        
        setMenteeRequests(pendingRequests);
        setActiveMentees(active);
      } catch (err: any) {
        console.error('Error fetching mentee data:', err);
        setError(err.message || 'Failed to load mentee data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMenteeData();
  }, [user, router]);
  
  const handleRequestAction = async (relationshipId: string, action: 'approve' | 'reject') => {
    if (!user) return;
    
    try {
      setProcessingId(relationshipId);
      setError(null);
      
      const status = action === 'approve' ? 'active' : 'rejected';
      const actionDate = new Date().toISOString();
      
      // Update the relationship status
      const { error: updateError } = await supabase
        .from('mentorship_relationships')
        .update({ 
          status,
          responded_at: actionDate
        })
        .eq('id', relationshipId);
        
      if (updateError) throw updateError;
      
      // Refresh the data
      const { data: refreshData, error: refreshError } = await supabase
        .from('mentorship_relationships')
        .select(`
          *,
          mentee:mentee_id(
            id,
            first_name,
            last_name,
            current_position,
            current_company,
            graduation_year,
            avatar_url,
            mentee_career_goals,
            mentee_mentorship_areas,
            mentee_skills_to_develop,
            mentee_time_commitment,
            email
          )
        `)
        .eq('mentor_id', user.id)
        .order('requested_at', { ascending: false });
        
      if (refreshError) throw refreshError;
      
      // Update state with fresh data
      const pendingRequests = refreshData?.filter(rel => rel.status === 'pending') || [];
      const active = refreshData?.filter(rel => rel.status === 'active') || [];
      
      setMenteeRequests(pendingRequests);
      setActiveMentees(active);
      
      setSuccessMessage(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      
    } catch (err: any) {
      console.error(`Error ${action}ing request:`, err);
      setError(err.message || `Failed to ${action} request`);
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleCompleteRelationship = async (relationshipId: string) => {
    if (!user) return;
    
    try {
      setProcessingId(relationshipId);
      setError(null);
      
      // Update the relationship status to completed
      const { error: updateError } = await supabase
        .from('mentorship_relationships')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', relationshipId);
        
      if (updateError) throw updateError;
      
      // Refresh the data
      const { data: refreshData, error: refreshError } = await supabase
        .from('mentorship_relationships')
        .select(`
          *,
          mentee:mentee_id(
            id,
            first_name,
            last_name,
            current_position,
            current_company,
            graduation_year,
            avatar_url,
            mentee_career_goals,
            mentee_mentorship_areas,
            mentee_skills_to_develop,
            mentee_time_commitment,
            email
          )
        `)
        .eq('mentor_id', user.id)
        .order('requested_at', { ascending: false });
        
      if (refreshError) throw refreshError;
      
      // Update state with fresh data
      const active = refreshData?.filter(rel => rel.status === 'active') || [];
      setActiveMentees(active);
      
      setSuccessMessage('Mentorship relationship marked as completed.');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      
    } catch (err: any) {
      console.error('Error completing relationship:', err);
      setError(err.message || 'Failed to complete mentorship relationship');
    } finally {
      setProcessingId(null);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Mentees</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <p>Loading mentee data...</p>
          </div>
        ) : (
          <>
            {/* Pending Requests */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-4">Pending Requests {menteeRequests.length > 0 && `(${menteeRequests.length})`}</h2>
              
              {menteeRequests.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-500 text-center">No pending mentee requests.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {menteeRequests.map(request => (
                    <div key={request.id} className="border rounded-lg overflow-hidden shadow-sm">
                      <div className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="relative h-16 w-16 rounded-full overflow-hidden">
                            {request.mentee.avatar_url ? (
                              <Image 
                                src={request.mentee.avatar_url}
                                alt={`${request.mentee.first_name} ${request.mentee.last_name}`}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">
                                {request.mentee.first_name.charAt(0)}{request.mentee.last_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium">{request.mentee.first_name} {request.mentee.last_name}</h3>
                            <p className="text-sm text-gray-600">
                              {request.mentee.current_position} {request.mentee.current_company ? `at ${request.mentee.current_company}` : ''}
                            </p>
                            <p className="text-sm text-gray-600">
                              Class of {request.mentee.graduation_year}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700">Career Goals</h4>
                          <p className="text-sm">{request.mentee.mentee_career_goals}</p>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700">Areas Seeking Mentorship</h4>
                          <p className="text-sm">{request.mentee.mentee_mentorship_areas}</p>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700">Skills to Develop</h4>
                          <p className="text-sm">{request.mentee.mentee_skills_to_develop}</p>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700">Time Commitment</h4>
                          <p className="text-sm">{request.mentee.mentee_time_commitment}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <Link href={`/directory/profiles/${request.mentee.id}`}>
                            <Button variant="outline" size="sm">View Full Profile</Button>
                          </Link>
                          
                          <div className="space-x-2">
                            <Button 
                              onClick={() => handleRequestAction(request.id, 'reject')}
                              variant="outline"
                              size="sm"
                              disabled={processingId === request.id}
                            >
                              Decline
                            </Button>
                            <Button 
                              onClick={() => handleRequestAction(request.id, 'approve')}
                              size="sm"
                              disabled={processingId === request.id}
                            >
                              Accept
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Active Mentees */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Mentees {activeMentees.length > 0 && `(${activeMentees.length})`}</h2>
              
              {activeMentees.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-500 text-center">No active mentees at this time.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeMentees.map(relationship => (
                    <div key={relationship.id} className="border rounded-lg overflow-hidden shadow-sm">
                      <div className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="relative h-16 w-16 rounded-full overflow-hidden">
                            {relationship.mentee.avatar_url ? (
                              <Image 
                                src={relationship.mentee.avatar_url}
                                alt={`${relationship.mentee.first_name} ${relationship.mentee.last_name}`}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">
                                {relationship.mentee.first_name.charAt(0)}{relationship.mentee.last_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium">{relationship.mentee.first_name} {relationship.mentee.last_name}</h3>
                            <p className="text-sm text-gray-600">
                              {relationship.mentee.current_position} {relationship.mentee.current_company ? `at ${relationship.mentee.current_company}` : ''}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <h4 className="text-sm font-medium text-gray-700">Email</h4>
                          <p className="text-sm">{relationship.mentee.email}</p>
                        </div>
                        
                        <div className="mb-2">
                          <h4 className="text-sm font-medium text-gray-700">Areas Seeking Mentorship</h4>
                          <p className="text-sm">{relationship.mentee.mentee_mentorship_areas}</p>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <Link href={`/mentorship/messages?relationship=${relationship.id}`}>
                            <Button variant="outline" size="sm">Message Mentee</Button>
                          </Link>
                          
                          <Button 
                            onClick={() => handleCompleteRelationship(relationship.id)}
                            variant="outline"
                            size="sm"
                            disabled={processingId === relationship.id}
                          >
                            Mark as Completed
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}