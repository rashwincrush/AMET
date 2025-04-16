'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function BookMentorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mentorId = searchParams?.get('mentor_id');
  const { user } = useAuth();
  
  const [mentor, setMentor] = useState<any>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  useEffect(() => {
    if (mentorId) {
      fetchMentorData(mentorId);
    }
  }, [mentorId]);
  
  useEffect(() => {
    if (mentorId && date) {
      fetchAvailabilityForDate(mentorId, date);
    }
  }, [mentorId, date]);
  
  const fetchMentorData = async (id: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('mentors')
        .select(`
          id,
          user_id,
          bio,
          mentor_topics,
          industry,
          max_mentees,
          profiles(
            first_name,
            last_name,
            avatar_url,
            graduation_year,
            current_position,
            current_company
          )
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      setMentor({
        ...data,
        first_name: data.profiles[0]?.first_name,
        last_name: data.profiles[0]?.last_name,
        avatar_url: data.profiles[0]?.avatar_url,
        graduation_year: data.profiles[0]?.graduation_year,
        current_position: data.profiles[0]?.current_position,
        current_company: data.profiles[0]?.current_company
      });
      
    } catch (error) {
      console.error('Error fetching mentor data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAvailabilityForDate = async (mentorId: string, selectedDate: Date) => {
    try {
      setLoadingSlots(true);
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('date', dateStr)
        .eq('is_booked', false)
        .order('start_time');
        
      if (error) throw error;
      
      setAvailableSlots(data || []);
      setSelectedSlotId(null); // Reset selection when date changes
      
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoadingSlots(false);
    }
  };
  
  const bookAppointment = async () => {
    try {
      if (!user?.id || !mentorId || !selectedSlotId || !meetingTopic) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      setLoading(true);
      
      // First, get mentee ID
      const { data: menteeData, error: menteeError } = await supabase
        .from('mentees')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (menteeError) {
        // If no mentee record exists, create one
        const { data: newMenteeData, error: createMenteeError } = await supabase
          .from('mentees')
          .insert({
            user_id: user.id,
            status: 'active',
            career_goals: ''
          })
          .select()
          .single();
          
        if (createMenteeError) throw createMenteeError;
        
        if (!newMenteeData || !newMenteeData.id) {
          throw new Error("Failed to create mentee record");
        }
        
        var menteeId = newMenteeData.id;
      } else {
        var menteeId = menteeData.id;
      }
      
      // Get the selected time slot
      const { data: slotData, error: slotError } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('id', selectedSlotId)
        .single();
        
      if (slotError) throw slotError;
      
      // Create the meeting
      const { data: meetingData, error: meetingError } = await supabase
        .from('mentorship_meetings')
        .insert({
          mentor_id: mentorId,
          mentee_id: menteeId,
          date: slotData.date,
          start_time: slotData.start_time,
          end_time: slotData.end_time,
          topic: meetingTopic,
          description: meetingDescription,
          status: 'scheduled'
        })
        .select()
        .single();
        
      if (meetingError) throw meetingError;
      
      // Mark the time slot as booked
      const { error: updateError } = await supabase
        .from('mentor_availability')
        .update({ is_booked: true })
        .eq('id', selectedSlotId);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Appointment booked",
        description: "Your mentorship meeting has been scheduled successfully.",
      });
      
      // Redirect to the mentorship dashboard
      router.push('/mentorship/my-mentors');
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error booking appointment",
        description: "There was a problem booking your appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!mentorId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Mentor Selected</CardTitle>
            <CardDescription>Please select a mentor first.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/mentorship/mentors">
              <Button>Find Mentors</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Book a Mentorship Meeting</h1>
          <Link href="/mentorship/mentors">
            <Button variant="outline">Back to Mentors</Button>
          </Link>
        </div>
        
        {loading && !mentor ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : mentor ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mentor Info */}
            <Card>
              <CardHeader>
                <CardTitle>Your Selected Mentor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={mentor.avatar_url || ''} alt={`${mentor.first_name} ${mentor.last_name}`} />
                    <AvatarFallback>
                      {mentor.first_name?.[0]}{mentor.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">{mentor.first_name} {mentor.last_name}</h3>
                    <p className="text-muted-foreground">{mentor.current_position} at {mentor.current_company}</p>
                    <p className="text-sm text-muted-foreground">Class of {mentor.graduation_year}</p>
                  </div>
                  
                  <div className="w-full mt-4">
                    <h4 className="font-medium mb-2">Mentorship Areas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {mentor.mentor_topics?.split(',').map((topic: string, i: number) => (
                        <span key={i} className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm">
                          {topic.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Select a Date</CardTitle>
                <CardDescription>Choose a date to see available time slots</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </CardContent>
            </Card>
            
            {/* Time Slots & Booking */}
            <Card>
              <CardHeader>
                <CardTitle>Available Time Slots</CardTitle>
                <CardDescription>Select an available time slot for {date?.toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSlots ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No time slots available for this date. Please select another date.
                  </div>
                ) : (
                  <RadioGroup value={selectedSlotId || ''} onValueChange={setSelectedSlotId}>
                    <div className="space-y-2">
                      {availableSlots.map((slot) => (
                        <div key={slot.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={slot.id} id={slot.id} />
                          <Label htmlFor={slot.id} className="flex-1">
                            {slot.start_time} - {slot.end_time}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
                
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Meeting Topic (Required)</Label>
                    <input
                      id="topic"
                      value={meetingTopic}
                      onChange={(e) => setMeetingTopic(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g. Career Advice, Resume Review"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={meetingDescription}
                      onChange={(e) => setMeetingDescription(e.target.value)}
                      placeholder="Briefly describe what you'd like to discuss"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={bookAppointment} 
                  disabled={loading || !selectedSlotId || !meetingTopic} 
                  className="w-full"
                >
                  {loading ? 'Booking...' : 'Book Appointment'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Mentor Not Found</CardTitle>
              <CardDescription>We couldn't find the selected mentor.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/mentorship/mentors">
                <Button>Find Mentors</Button>
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
} 