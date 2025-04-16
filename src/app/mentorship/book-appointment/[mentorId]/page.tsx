'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { format, isEqual, parseISO, formatDistanceToNow } from 'date-fns';
import { Calendar as CalendarIcon, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import Breadcrumbs from '@/components/Breadcrumbs';
import NoData from '@/components/NoData';
import NotFound from '@/components/NotFound';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Mentor {
  id: string;
  user_id: string;
  bio: string;
  expertise: string[];
  years_of_experience: number;
  industry: string;
  max_mentees: number;
  mentoring_topics: string[];
  mentoring_capacity: number;
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
    current_position: string;
    current_company: string;
  };
}

interface Availability {
  id: string;
  mentor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

/**
 * Formats a date into a string with the format 'MMMM d, yyyy'
 * @param date A Date object or date string
 * @returns Formatted date string or the original string if formatting fails
 */
function formatDate(date: Date | string): string {
  try {
    if (date instanceof Date) {
      return format(date, 'MMMM d, yyyy');
    }
    
    // Try to convert string to date
    const dateObj = new Date(date);
    return format(dateObj, 'MMMM d, yyyy');
  } catch (error) {
    // If there's an error parsing the date, return the original string
    return String(date);
  }
}

export default function BookAppointmentPage({ params }: { params: { mentorId: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { mentorId } = params;
  
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [menteeId, setMenteeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [timeSlots, setTimeSlots] = useState<Availability[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    topic: '',
    description: '',
    meeting_link: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchMentorDetails();
      checkMenteeStatus();
    }
  }, [user, mentorId]);
  
  useEffect(() => {
    if (mentor) {
      fetchAvailableDates();
    }
  }, [mentor]);
  
  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots();
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate]);
  
  const fetchMentorDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mentors')
        .select(`
          *,
          profile:profiles(
            id,
            first_name,
            last_name,
            avatar_url,
            current_position,
            current_company
          )
        `)
        .eq('id', mentorId)
        .single();
        
      if (error) throw error;
      setMentor(data);
    } catch (error) {
      console.error('Error fetching mentor details:', error);
      toast({
        title: "Error loading mentor",
        description: "Could not load mentor details. Please try again.",
        variant: "destructive"
      });
      router.push('/mentorship/mentors');
    } finally {
      setLoading(false);
    }
  };
  
  const checkMenteeStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('mentees')
        .select('id')
        .eq('user_id', user!.id)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // Not a mentee
          toast({
            title: "Registration required",
            description: "You need to register as a mentee before booking appointments.",
            variant: "destructive"
          });
          router.push('/mentorship/become-mentee');
          return;
        }
        throw error;
      }
      
      setMenteeId(data.id);
    } catch (error) {
      console.error('Error checking mentee status:', error);
    }
  };
  
  const fetchAvailableDates = async () => {
    try {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('date')
        .eq('mentor_id', mentorId)
        .eq('is_booked', false)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });
        
      if (error) throw error;
      
      // Get unique dates using Set and convert to array properly
      const dateSet = new Set(data.map((item: { date: string }) => item.date));
      setAvailableDates(Array.from(dateSet).map(date => new Date(date)));
    } catch (error) {
      console.error('Error fetching available dates:', error);
    }
  };
  
  const fetchTimeSlots = async () => {
    if (!selectedDate) return;
    
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('date', formattedDate)
        .eq('is_booked', false)
        .order('start_time', { ascending: true });
        
      if (error) throw error;
      
      setTimeSlots(data || []);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };
  
  const handleBookingSubmit = async () => {
    if (!selectedSlot || !menteeId || !user?.id) return;
    
    try {
      setIsSubmitting(true);
      
      // 1. Create the meeting record
      const { data: meetingData, error: meetingError } = await supabase
        .from('mentorship_meetings')
        .insert({
          mentor_id: mentorId,
          mentee_id: menteeId,
          date: selectedSlot.date,
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
          topic: bookingDetails.topic,
          description: bookingDetails.description,
          meeting_link: bookingDetails.meeting_link || null,
          status: 'scheduled'
        })
        .select()
        .single();
        
      if (meetingError) throw meetingError;
      
      // 2. Update the availability to mark it as booked
      const { error: availabilityError } = await supabase
        .from('mentor_availability')
        .update({ is_booked: true })
        .eq('id', selectedSlot.id);
        
      if (availabilityError) throw availabilityError;
      
      toast({
        title: "Appointment booked",
        description: "Your meeting has been successfully scheduled.",
      });
      
      // Redirect to meetings page
      router.push('/mentorship/my-meetings');
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Booking failed",
        description: "There was a problem booking your appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/mentorship/mentors">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Book an Appointment</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : !mentor ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium">Mentor not found</h3>
            <p className="text-muted-foreground">
              The mentor you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/mentorship/mentors" className="mt-4 inline-block">
              <Button>Browse Mentors</Button>
            </Link>
          </div>
        ) : !menteeId ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium">Registration Required</h3>
            <p className="text-muted-foreground">
              You need to register as a mentee before booking appointments.
            </p>
            <Link href="/mentorship/become-mentee" className="mt-4 inline-block">
              <Button>Register as Mentee</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_350px] gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Date & Time</CardTitle>
                  <CardDescription>
                    Choose an available date and time slot for your mentorship meeting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-4">Available Dates</h3>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date: Date) => {
                          const formattedCurrentDate = formatDate(date);
                          return !availableDates.some(availableDate => 
                            formatDate(availableDate) === formattedCurrentDate
                          );
                        }}
                        className="rounded-md border shadow mb-4"
                      />
                      {availableDates.length === 0 && (
                        <p className="text-sm text-muted-foreground mt-4">
                          No available dates found. The mentor hasn't set any availability yet.
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-4">Available Time Slots</h3>
                      {!selectedDate ? (
                        <p className="text-sm text-muted-foreground">
                          Please select a date to see available time slots.
                        </p>
                      ) : timeSlots.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No available time slots for the selected date.
                        </p>
                      ) : (
                        <div className="grid gap-2">
                          {timeSlots.map((slot) => (
                            <Button
                              key={slot.id}
                              variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => setSelectedSlot(slot)}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button 
                    disabled={!selectedSlot} 
                    onClick={() => setBookingFormOpen(true)}
                  >
                    Continue
                  </Button>
                </CardFooter>
              </Card>
              
              <Dialog open={bookingFormOpen} onOpenChange={setBookingFormOpen}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Book Appointment</DialogTitle>
                    <DialogDescription>
                      Provide details about what you'd like to discuss in this mentorship meeting.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="flex items-center gap-4 p-2 bg-muted/50 rounded-md">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {selectedSlot?.date && new Date(selectedSlot.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedSlot && `${formatTime(selectedSlot.start_time)} - ${formatTime(selectedSlot.end_time)}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic">Discussion Topic</Label>
                      <Input
                        id="topic"
                        value={bookingDetails.topic}
                        onChange={(e) => setBookingDetails({...bookingDetails, topic: e.target.value})}
                        placeholder="e.g., Career transition advice, Resume review"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description <span className="text-sm text-muted-foreground">(optional)</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={bookingDetails.description}
                        onChange={(e) => setBookingDetails({...bookingDetails, description: e.target.value})}
                        placeholder="Please share some context about what you'd like to discuss or what you hope to get out of this meeting."
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="meeting-link">
                        Meeting Link <span className="text-sm text-muted-foreground">(optional)</span>
                      </Label>
                      <Input
                        id="meeting-link"
                        value={bookingDetails.meeting_link}
                        onChange={(e) => setBookingDetails({...bookingDetails, meeting_link: e.target.value})}
                        placeholder="e.g., Zoom or Google Meet link (optional)"
                      />
                      <p className="text-xs text-muted-foreground">
                        You can provide your own meeting link or coordinate with your mentor later.
                      </p>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBookingFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleBookingSubmit} 
                      disabled={!bookingDetails.topic || isSubmitting}
                    >
                      {isSubmitting ? 'Booking...' : 'Book Appointment'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Mentor Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={mentor.profile.avatar_url || ''} alt={`${mentor.profile.first_name} ${mentor.profile.last_name}`} />
                    <AvatarFallback>
                      {mentor.profile.first_name?.[0]}{mentor.profile.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold">{mentor.profile.first_name} {mentor.profile.last_name}</h3>
                  <p className="text-muted-foreground">
                    {mentor.profile.current_position} at {mentor.profile.current_company}
                  </p>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Bio</h4>
                    <p className="text-sm">{mentor.bio}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Industry</h4>
                    <p className="text-sm">{mentor.industry}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Experience</h4>
                    <p className="text-sm">{mentor.years_of_experience} years</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Mentoring Topics</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {mentor.mentoring_topics && mentor.mentoring_topics.map((topic, i) => (
                        <Badge key={i} variant="secondary">{topic}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Link href={`/mentorship/mentors/${mentorId}`} className="block mt-6">
                  <Button variant="outline" className="w-full">View Full Profile</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 