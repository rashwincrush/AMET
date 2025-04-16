'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Link as LinkIcon, MessageCircle, Video, X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface MeetingWithParticipants {
  id: string;
  mentor_id: string;
  mentee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  topic: string;
  description: string;
  meeting_link: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  mentor: {
    profile: {
      first_name: string;
      last_name: string;
      avatar_url: string;
      current_position: string;
      current_company: string;
    };
  };
  mentee: {
    profile: {
      first_name: string;
      last_name: string;
      avatar_url: string;
    };
  };
}

export default function MyMeetingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState<MeetingWithParticipants[]>([]);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [menteeId, setMenteeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [meetingToCancel, setMeetingToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [meetingToComplete, setMeetingToComplete] = useState<string | null>(null);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchUserRoles();
    }
  }, [user]);
  
  useEffect(() => {
    if (mentorId || menteeId) {
      fetchMeetings();
    }
  }, [mentorId, menteeId, activeTab]);
  
  const fetchUserRoles = async () => {
    try {
      // Check if user is a mentor
      const { data: mentorData, error: mentorError } = await supabase
        .from('mentors')
        .select('id')
        .eq('user_id', user!.id)
        .single();
        
      if (!mentorError) {
        setMentorId(mentorData.id);
      }
      
      // Check if user is a mentee
      const { data: menteeData, error: menteeError } = await supabase
        .from('mentees')
        .select('id')
        .eq('user_id', user!.id)
        .single();
        
      if (!menteeError) {
        setMenteeId(menteeData.id);
      }
      
      // If not a mentor or mentee, user hasn't registered for either
      if (mentorError && mentorError.code === 'PGRST116' && 
          menteeError && menteeError.code === 'PGRST116') {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };
  
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('mentorship_meetings')
        .select(`
          *,
          mentor:mentors(
            profile:profiles(
              first_name,
              last_name,
              avatar_url,
              current_position,
              current_company
            )
          ),
          mentee:mentees(
            profile:profiles(
              first_name,
              last_name,
              avatar_url
            )
          )
        `);
      
      // Filter by mentor_id or mentee_id
      if (mentorId) {
        query = query.eq('mentor_id', mentorId);
      }
      
      if (menteeId) {
        query = query.eq('mentee_id', menteeId);
      }
      
      // Filter by status based on the active tab
      if (activeTab === 'upcoming') {
        query = query.eq('status', 'scheduled')
                     .gte('date', new Date().toISOString().split('T')[0])
                     .order('date', { ascending: true })
                     .order('start_time', { ascending: true });
      } else if (activeTab === 'past') {
        query = query.or(`status.eq.completed,status.eq.cancelled,date.lt.${new Date().toISOString().split('T')[0]}`)
                     .order('date', { ascending: false })
                     .order('start_time', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setMeetings(data as MeetingWithParticipants[]);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: "Error loading meetings",
        description: "There was a problem loading your meetings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenCancelDialog = (meetingId: string) => {
    setMeetingToCancel(meetingId);
    setCancelDialogOpen(true);
  };
  
  const handleOpenCompleteDialog = (meetingId: string) => {
    setMeetingToComplete(meetingId);
    setCompleteDialogOpen(true);
  };
  
  const handleCancelMeeting = async () => {
    if (!meetingToCancel) return;
    
    try {
      setSubmitting(true);
      
      // Get the meeting to find its availability slot
      const { data: meetingData, error: meetingFetchError } = await supabase
        .from('mentorship_meetings')
        .select('*')
        .eq('id', meetingToCancel)
        .single();
        
      if (meetingFetchError) throw meetingFetchError;
      
      // Update meeting status to cancelled
      const { error: updateError } = await supabase
        .from('mentorship_meetings')
        .update({ 
          status: 'cancelled', 
          notes: cancelReason.length > 0 ? `Cancellation reason: ${cancelReason}` : 'Cancelled by user'
        })
        .eq('id', meetingToCancel);
        
      if (updateError) throw updateError;
      
      // Find and update the availability slot to free it up again
      const { data: availabilityData, error: availabilityFetchError } = await supabase
        .from('mentor_availability')
        .select('id')
        .eq('mentor_id', meetingData.mentor_id)
        .eq('date', meetingData.date)
        .eq('start_time', meetingData.start_time)
        .eq('end_time', meetingData.end_time)
        .eq('is_booked', true);
        
      if (!availabilityFetchError && availabilityData && availabilityData.length > 0) {
        // Update availability to mark it as not booked
        const { error: availabilityUpdateError } = await supabase
          .from('mentor_availability')
          .update({ is_booked: false })
          .eq('id', availabilityData[0].id);
          
        if (availabilityUpdateError) {
          console.error('Error updating availability:', availabilityUpdateError);
        }
      }
      
      toast({
        title: "Meeting cancelled",
        description: "The meeting has been successfully cancelled.",
      });
      
      // Update the meetings list
      fetchMeetings();
      
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      toast({
        title: "Cancellation failed",
        description: "There was a problem cancelling your meeting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
      setCancelDialogOpen(false);
      setMeetingToCancel(null);
      setCancelReason('');
    }
  };
  
  const handleCompleteMeeting = async () => {
    if (!meetingToComplete) return;
    
    try {
      setSubmitting(true);
      
      // Update meeting status to completed
      const { error: updateError } = await supabase
        .from('mentorship_meetings')
        .update({ 
          status: 'completed', 
          notes: meetingNotes
        })
        .eq('id', meetingToComplete);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Meeting completed",
        description: "The meeting has been marked as completed.",
      });
      
      // Update the meetings list
      fetchMeetings();
      
    } catch (error) {
      console.error('Error completing meeting:', error);
      toast({
        title: "Action failed",
        description: "There was a problem updating your meeting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
      setCompleteDialogOpen(false);
      setMeetingToComplete(null);
      setMeetingNotes('');
    }
  };
  
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
  };
  
  const getMeetingStatusBadge = (meeting: MeetingWithParticipants) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (meeting.status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    } else if (meeting.status === 'completed') {
      return <Badge variant="secondary">Completed</Badge>;
    } else if (meeting.date < today) {
      return <Badge variant="outline">Passed</Badge>;
    } else if (meeting.date === today) {
      return <Badge variant="default" className="bg-green-600">Today</Badge>;
    } else {
      return <Badge variant="outline" className="border-green-600 text-green-600">Upcoming</Badge>;
    }
  };
  
  const canCancel = (meeting: MeetingWithParticipants) => {
    return meeting.status === 'scheduled' && 
           new Date(meeting.date) > new Date();
  };
  
  const canComplete = (meeting: MeetingWithParticipants) => {
    const today = new Date().toISOString().split('T')[0];
    return meeting.status === 'scheduled' && 
           (meeting.date < today || meeting.date === today);
  };
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">My Mentorship Meetings</h1>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (!mentorId && !menteeId) ? (
          <Card>
            <CardHeader>
              <CardTitle>Not Registered</CardTitle>
              <CardDescription>
                You need to be registered as a mentor or mentee to view meetings.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link href="/mentorship/become-mentor">
                <Button className="w-full">Become a Mentor</Button>
              </Link>
              <Link href="/mentorship/become-mentee">
                <Button className="w-full" variant="outline">Become a Mentee</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>
                {menteeId && (
                  <Link href="/mentorship/mentors">
                    <Button>Find a Mentor</Button>
                  </Link>
                )}
              </div>
              
              <TabsContent value="upcoming">
                {meetings.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Upcoming Meetings</CardTitle>
                      <CardDescription>
                        You don't have any scheduled mentorship meetings.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {menteeId && (
                        <div className="text-center py-4">
                          <p className="mb-4">Ready to connect with a mentor?</p>
                          <Link href="/mentorship/mentors">
                            <Button>Browse Mentors</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {meetings.map((meeting) => (
                      <Card key={meeting.id} className="overflow-hidden">
                        <div className="bg-muted px-6 py-4 flex flex-wrap gap-2 justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{formatDate(meeting.date)}</span>
                            <span className="text-muted-foreground mx-1">•</span>
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <span>{formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}</span>
                          </div>
                          <div>
                            {getMeetingStatusBadge(meeting)}
                          </div>
                        </div>
                        
                        <CardContent className="grid sm:grid-cols-[1fr_auto] gap-6 p-6">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xl font-bold mb-1">{meeting.topic}</h3>
                              {meeting.description && (
                                <p className="text-muted-foreground">{meeting.description}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <div className="font-medium text-sm text-muted-foreground">
                                  {mentorId && meeting.mentor_id === mentorId ? 'Mentee:' : 'Mentor:'}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage 
                                      src={
                                        mentorId && meeting.mentor_id === mentorId
                                          ? meeting.mentee.profile.avatar_url
                                          : meeting.mentor.profile.avatar_url
                                      } 
                                      alt="Profile" 
                                    />
                                    <AvatarFallback>
                                      {mentorId && meeting.mentor_id === mentorId
                                        ? meeting.mentee.profile.first_name?.[0] + meeting.mentee.profile.last_name?.[0]
                                        : meeting.mentor.profile.first_name?.[0] + meeting.mentor.profile.last_name?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">
                                    {mentorId && meeting.mentor_id === mentorId
                                      ? `${meeting.mentee.profile.first_name} ${meeting.mentee.profile.last_name}`
                                      : `${meeting.mentor.profile.first_name} ${meeting.mentor.profile.last_name}`}
                                  </span>
                                  {meeting.mentor_id !== mentorId && (
                                    <span className="text-sm text-muted-foreground hidden sm:inline">
                                      {meeting.mentor.profile.current_position} at {meeting.mentor.profile.current_company}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-3 sm:justify-end sm:items-end">
                            {meeting.meeting_link && (
                              <a 
                                href={meeting.meeting_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2"
                              >
                                <Button variant="outline" className="flex items-center gap-2">
                                  <Video className="h-4 w-4" />
                                  <span>Join Meeting</span>
                                </Button>
                              </a>
                            )}
                            
                            <div className="flex gap-2">
                              {canComplete(meeting) && (
                                <Button 
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleOpenCompleteDialog(meeting.id)}
                                  className="flex items-center gap-1"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Complete</span>
                                </Button>
                              )}
                              
                              {canCancel(meeting) && (
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenCancelDialog(meeting.id)}
                                  className="flex items-center gap-1 text-red-500 hover:text-red-600"
                                >
                                  <X className="h-4 w-4" />
                                  <span>Cancel</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="past">
                {meetings.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Past Meetings</CardTitle>
                      <CardDescription>
                        You don't have any past mentorship meetings.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {meetings.map((meeting) => (
                      <Card key={meeting.id}>
                        <div className="bg-muted px-6 py-4 flex flex-wrap gap-2 justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{formatDate(meeting.date)}</span>
                            <span className="text-muted-foreground mx-1">•</span>
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <span>{formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}</span>
                          </div>
                          <div>
                            {getMeetingStatusBadge(meeting)}
                          </div>
                        </div>
                        
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xl font-bold mb-1">{meeting.topic}</h3>
                              {meeting.description && (
                                <p className="text-muted-foreground mb-4">{meeting.description}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <div className="font-medium text-sm text-muted-foreground">
                                  {mentorId && meeting.mentor_id === mentorId ? 'Mentee:' : 'Mentor:'}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage 
                                      src={
                                        mentorId && meeting.mentor_id === mentorId
                                          ? meeting.mentee.profile.avatar_url
                                          : meeting.mentor.profile.avatar_url
                                      } 
                                      alt="Profile" 
                                    />
                                    <AvatarFallback>
                                      {mentorId && meeting.mentor_id === mentorId
                                        ? meeting.mentee.profile.first_name?.[0] + meeting.mentee.profile.last_name?.[0]
                                        : meeting.mentor.profile.first_name?.[0] + meeting.mentor.profile.last_name?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">
                                    {mentorId && meeting.mentor_id === mentorId
                                      ? `${meeting.mentee.profile.first_name} ${meeting.mentee.profile.last_name}`
                                      : `${meeting.mentor.profile.first_name} ${meeting.mentor.profile.last_name}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {meeting.notes && meeting.status === 'completed' && (
                              <div className="mt-4 p-4 bg-muted rounded-md">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <MessageCircle className="h-4 w-4" />
                                  Meeting Notes
                                </h4>
                                <p className="text-sm whitespace-pre-wrap">{meeting.notes}</p>
                              </div>
                            )}
                            
                            {meeting.notes && meeting.status === 'cancelled' && (
                              <div className="mt-4 p-4 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 rounded-md">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4" />
                                  Cancellation Reason
                                </h4>
                                <p className="text-sm">{meeting.notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Cancel Meeting Dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Meeting</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel this meeting? This will free up the time slot and notify the other participant.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <label className="text-sm font-medium mb-2 block">
                    Reason for cancellation (optional)
                  </label>
                  <Textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason for cancelling this meeting"
                    className="min-h-[100px]"
                  />
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setCancelDialogOpen(false)}
                    disabled={submitting}
                  >
                    Nevermind
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelMeeting}
                    disabled={submitting}
                  >
                    {submitting ? 'Cancelling...' : 'Cancel Meeting'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Complete Meeting Dialog */}
            <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mark as Completed</DialogTitle>
                  <DialogDescription>
                    Mark this meeting as completed and add any notes or takeaways from the session.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <label className="text-sm font-medium mb-2 block">
                    Meeting Notes (optional)
                  </label>
                  <Textarea
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    placeholder="Add any notes, action items, or key takeaways from the meeting"
                    className="min-h-[150px]"
                  />
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setCompleteDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCompleteMeeting}
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Mark as Completed'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
} 