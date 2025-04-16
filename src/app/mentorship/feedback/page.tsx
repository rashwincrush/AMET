'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { toast } from 'sonner';

export default function MentorshipFeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const meetingId = searchParams?.get('meeting_id');
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [meeting, setMeeting] = useState<any>(null);
  const [mentor, setMentor] = useState<any>(null);
  const [mentee, setMentee] = useState<any>(null);
  
  const [rating, setRating] = useState<number>(0);
  const [meetingQuality, setMeetingQuality] = useState<number>(0);
  const [mentorPreparation, setMentorPreparation] = useState<number>(0);
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatCouldImprove, setWhatCouldImprove] = useState('');
  const [interestedInFutureMeetings, setInterestedInFutureMeetings] = useState(false);
  
  useEffect(() => {
    if (user && meetingId) {
      fetchMeetingDetails();
    } else if (!meetingId) {
      toast.error('Missing meeting ID');
      router.push('/mentorship/my-meetings');
    }
  }, [user, meetingId]);
  
  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      
      const { data: meetingData, error: meetingError } = await supabase
        .from('mentorship_meetings')
        .select(`
          *,
          mentor:mentors!mentorship_meetings_mentor_id_fkey(
            id,
            profile:profiles(
              first_name,
              last_name,
              avatar_url,
              current_position,
              current_company
            )
          ),
          mentee:mentees!mentorship_meetings_mentee_id_fkey(
            id,
            profile:profiles(
              first_name,
              last_name,
              avatar_url
            )
          )
        `)
        .eq('id', meetingId)
        .single();
        
      if (meetingError) throw meetingError;
      
      if (!meetingData) {
        toast.error('Meeting not found');
        router.push('/mentorship/my-meetings');
        return;
      }
      
      // Check if user is either the mentor or mentee
      const mentorId = meetingData.mentor?.profile?.id;
      const menteeId = meetingData.mentee?.profile?.id;
      
      if (user.id !== mentorId && user.id !== menteeId) {
        toast.error('You do not have permission to provide feedback for this meeting');
        router.push('/mentorship/my-meetings');
        return;
      }
      
      // Check if meeting is completed
      if (meetingData.status !== 'completed') {
        toast.error('You can only provide feedback for completed meetings');
        router.push('/mentorship/my-meetings');
        return;
      }
      
      // Check if feedback already provided
      const { data: existingFeedback, error: feedbackError } = await supabase
        .from('mentorship_feedback')
        .select('id')
        .eq('meeting_id', meetingId)
        .eq('submitted_by', user.id)
        .maybeSingle();
        
      if (feedbackError) throw feedbackError;
      
      if (existingFeedback) {
        toast.info('You have already provided feedback for this meeting');
        router.push('/mentorship/my-meetings');
        return;
      }
      
      setMeeting(meetingData);
      setMentor({
        id: meetingData.mentor.id,
        first_name: meetingData.mentor.profile.first_name,
        last_name: meetingData.mentor.profile.last_name,
        avatar_url: meetingData.mentor.profile.avatar_url,
        current_position: meetingData.mentor.profile.current_position,
        current_company: meetingData.mentor.profile.current_company
      });
      setMentee({
        id: meetingData.mentee.id,
        first_name: meetingData.mentee.profile.first_name,
        last_name: meetingData.mentee.profile.last_name,
        avatar_url: meetingData.mentee.profile.avatar_url
      });
    } catch (error) {
      console.error('Error fetching meeting details:', error);
      toast.error('Failed to load meeting details');
      router.push('/mentorship/my-meetings');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const feedbackData = {
        meeting_id: meetingId,
        submitted_by: user!.id,
        role: user!.id === mentor?.id ? 'mentor' : 'mentee',
        overall_rating: rating,
        meeting_quality: meetingQuality,
        mentor_preparation: mentorPreparation,
        what_went_well: whatWentWell,
        what_could_improve: whatCouldImprove,
        interested_in_future: interestedInFutureMeetings
      };
      
      const { error } = await supabase
        .from('mentorship_feedback')
        .insert(feedbackData);
        
      if (error) throw error;
      
      toast.success('Thank you for your feedback!');
      
      // Redirect back to meetings page
      setTimeout(() => {
        router.push('/mentorship/my-meetings');
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };
  
  const renderRatingSelector = (
    label: string,
    value: number,
    setValue: (value: number) => void
  ) => {
    return (
      <div className="space-y-3">
        <Label>{label}</Label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setValue(star)}
              className={`h-8 w-8 rounded-full ${
                star <= value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-400'
              } flex items-center justify-center hover:bg-blue-200`}
            >
              {star}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/mentorship/my-meetings">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Mentorship Feedback</h1>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Meeting Feedback</CardTitle>
            <CardDescription>
              Share your thoughts on your mentorship session with {user?.id === mentor?.id ? mentee?.first_name : mentor?.first_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium">Meeting Details</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p><span className="font-medium">Date:</span> {new Date(meeting?.date).toLocaleDateString()}</p>
                <p><span className="font-medium">Topic:</span> {meeting?.topic}</p>
                <p><span className="font-medium">With:</span> {user?.id === mentor?.id ? `${mentee?.first_name} ${mentee?.last_name}` : `${mentor?.first_name} ${mentor?.last_name}`}</p>
              </div>
            </div>
            
            {renderRatingSelector('Overall Rating', rating, setRating)}
            {renderRatingSelector('Meeting Quality', meetingQuality, setMeetingQuality)}
            {renderRatingSelector('Mentor Preparation', mentorPreparation, setMentorPreparation)}
            
            <div className="space-y-3">
              <Label htmlFor="went-well">What went well during the session?</Label>
              <Textarea
                id="went-well"
                placeholder="Share positive aspects of the mentorship session"
                value={whatWentWell}
                onChange={(e) => setWhatWentWell(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="could-improve">What could be improved?</Label>
              <Textarea
                id="could-improve"
                placeholder="Any suggestions to enhance future sessions"
                value={whatCouldImprove}
                onChange={(e) => setWhatCouldImprove(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="future-meetings"
                checked={interestedInFutureMeetings}
                onCheckedChange={(checked) => setInterestedInFutureMeetings(checked === true)}
              />
              <Label htmlFor="future-meetings">I would be interested in having more sessions</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push('/mentorship/my-meetings')}>
              Cancel
            </Button>
            <Button onClick={handleSubmitFeedback} disabled={submitting || rating === 0}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ProtectedRoute>
  );
} 