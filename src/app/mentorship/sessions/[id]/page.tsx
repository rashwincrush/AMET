'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { AlertCircle, Check, Clock, Video, FileText, MessageSquare } from 'lucide-react';

export default function SessionDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = params.id;
  
  const [session, setSession] = useState<any>(null);
  const [mentee, setMentee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (!user || !sessionId) return;
    
    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch the session details
        const { data: sessionData, error: sessionError } = await supabase
          .from('mentorship_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();
          
        if (sessionError) throw sessionError;
        
        // Check if the current user is the mentor for this session
        if (sessionData.mentor_id !== user.id) {
          setError('You do not have permission to view this session');
          setLoading(false);
          return;
        }
        
        setSession(sessionData);
        setMeetingLink(sessionData.meeting_link || '');
        setNotes(sessionData.notes || '');
        
        // Fetch the mentee details
        const { data: menteeData, error: menteeError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.mentee_id)
          .single();
          
        if (menteeError) throw menteeError;
        
        setMentee(menteeData);
      } catch (error: any) {
        console.error('Error fetching session details:', error.message);
        setError('Failed to fetch session details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionDetails();
  }, [user, sessionId]);
  
  const handleUpdateSession = async () => {
    if (!user || !sessionId) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const { error } = await supabase
        .from('mentorship_sessions')
        .update({
          meeting_link: meetingLink,
          notes: notes
        })
        .eq('id', sessionId);
        
      if (error) throw error;
      
      setSuccess('Session details updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating session:', error.message);
      setError('Failed to update session details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelSession = async () => {
    if (!user || !sessionId) return;
    
    if (!confirm('Are you sure you want to cancel this session? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('mentorship_sessions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: user.id
        })
        .eq('id', sessionId);
        
      if (error) throw error;
      
      setSuccess('Session cancelled successfully');
      
      // Reload the session data
      const { data: updatedSession, error: sessionError } = await supabase
        .from('mentorship_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
        
      if (sessionError) throw sessionError;
      
      setSession(updatedSession);
    } catch (error: any) {
      console.error('Error cancelling session:', error.message);
      setError('Failed to cancel session');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time for display
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mentoring Session Details</h1>
          <Link href="/mentorship/schedule">
            <Button variant="outline">Back to Schedule</Button>
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6 flex items-center">
                <Check className="h-5 w-5 mr-2" />
                <span>{success}</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Session Information</CardTitle>
                    <CardDescription>
                      Details about the scheduled mentoring session
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Date and Time</h3>
                          <p>{formatDate(session?.session_date)}</p>
                          <p className="text-sm text-gray-600">
                            {formatTime(session?.start_time)} - {formatTime(session?.end_time)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <MessageSquare className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Status</h3>
                          <p className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            session?.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                            session?.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            session?.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {session?.status === 'scheduled' ? 'Scheduled' : 
                             session?.status === 'completed' ? 'Completed' : 
                             session?.status === 'cancelled' ? 'Cancelled' : 
                             'Unknown'}
                          </p>
                          {session?.status === 'cancelled' && (
                            <p className="text-sm text-gray-500 mt-1">
                              Cancelled on {new Date(session.cancelled_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {isEditing ? (
                        <div className="space-y-4 mt-6">
                          <div>
                            <Label htmlFor="meeting-link">Meeting Link</Label>
                            <Input
                              id="meeting-link"
                              type="url"
                              placeholder="https://zoom.us/j/123456789"
                              value={meetingLink}
                              onChange={(e) => setMeetingLink(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="notes">Session Notes</Label>
                            <Textarea
                              id="notes"
                              placeholder="Add any notes about the session..."
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              rows={4}
                              className="mt-1"
                            />
                          </div>
                          
                          <div className="flex space-x-3 pt-2">
                            <Button onClick={handleUpdateSession} disabled={loading}>
                              {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : 'Save Changes'}
                            </Button>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start space-x-3">
                            <Video className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <h3 className="font-medium">Meeting Link</h3>
                              {session?.meeting_link ? (
                                <a 
                                  href={session.meeting_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {session.meeting_link}
                                </a>
                              ) : (
                                <p className="text-gray-500">No meeting link provided yet</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <h3 className="font-medium">Notes</h3>
                              {session?.notes ? (
                                <p className="whitespace-pre-line">{session.notes}</p>
                              ) : (
                                <p className="text-gray-500">No notes added yet</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-3 pt-4">
                            <Button onClick={() => setIsEditing(true)} disabled={session?.status !== 'scheduled'}>
                              Edit Details
                            </Button>
                            {session?.status === 'scheduled' && (
                              <Button variant="destructive" onClick={handleCancelSession}>
                                Cancel Session
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Session Notes</CardTitle>
                    <CardDescription>
                      Record notes during or after the session for future reference
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {session?.status !== 'scheduled' && !isEditing ? (
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Add notes from your session..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={6}
                          className="w-full"
                        />
                        
                        <Button onClick={handleUpdateSession} disabled={loading}>
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : 'Save Notes'}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <p>You can add notes after the session has been completed</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Mentee Information</CardTitle>
                    <CardDescription>
                      Details about your mentee
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {mentee && (
                      <div className="space-y-4">
                        <div className="flex flex-col items-center">
                          {mentee.avatar_url ? (
                            <img 
                              src={mentee.avatar_url} 
                              alt={`${mentee.first_name} ${mentee.last_name}`} 
                              className="h-24 w-24 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-2xl font-medium text-gray-600">
                                {mentee.first_name?.charAt(0)}{mentee.last_name?.charAt(0)}
                              </span>
                            </div>
                          )}
                          <h3 className="font-medium text-lg mt-2">{mentee.first_name} {mentee.last_name}</h3>
                          <p className="text-sm text-gray-600">Class of {mentee.graduation_year}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm text-gray-500">Email</h4>
                          <p>{mentee.email}</p>
                        </div>
                        
                        {mentee.current_position && (
                          <div>
                            <h4 className="font-medium text-sm text-gray-500">Current Position</h4>
                            <p>{mentee.current_position}</p>
                            {mentee.current_company && <p className="text-sm">{mentee.current_company}</p>}
                          </div>
                        )}
                        
                        {mentee.industry && (
                          <div>
                            <h4 className="font-medium text-sm text-gray-500">Industry</h4>
                            <p>{mentee.industry}</p>
                          </div>
                        )}
                        
                        <div className="pt-2">
                          <Link href={`/mentorship/mentees/${mentee.id}`}>
                            <Button variant="outline" className="w-full">
                              View Full Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Session Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {session?.status === 'scheduled' && (
                        <>
                          <Button className="w-full" variant="default">
                            Start Meeting
                          </Button>
                          <Button className="w-full" variant="outline">
                            Send Reminder
                          </Button>
                        </>
                      )}
                      {session?.status === 'completed' && (
                        <Button className="w-full" variant="outline">
                          Schedule Follow-up
                        </Button>
                      )}
                      <Link href="/mentorship/schedule">
                        <Button variant="outline" className="w-full">
                          Back to Schedule
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
} 