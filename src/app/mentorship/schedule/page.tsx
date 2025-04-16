'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { toast } from '@/components/ui/use-toast';

export default function MentorSchedulePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<{id?: string, start_time: string, end_time: string, selected: boolean}[]>([
    { start_time: '09:00', end_time: '10:00', selected: false },
    { start_time: '10:00', end_time: '11:00', selected: false },
    { start_time: '11:00', end_time: '12:00', selected: false },
    { start_time: '13:00', end_time: '14:00', selected: false },
    { start_time: '14:00', end_time: '15:00', selected: false },
    { start_time: '15:00', end_time: '16:00', selected: false },
    { start_time: '16:00', end_time: '17:00', selected: false },
  ]);
  
  const [loading, setLoading] = useState(false);
  const [isMentor, setIsMentor] = useState(false);
  const [existingSchedule, setExistingSchedule] = useState<Record<string, any[]>>({});
  
  useEffect(() => {
    if (user) {
      checkMentorStatus();
      if (date) {
        fetchAvailabilityForDate(date);
      }
    }
  }, [user, date]);
  
  const checkMentorStatus = async () => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('mentors')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .single();
        
      if (error) throw error;
      setIsMentor(!!data);
      
    } catch (error) {
      console.error('Error checking mentor status:', error);
    }
  };
  
  const fetchAvailabilityForDate = async (selectedDate: Date) => {
    try {
      setLoading(true);
      if (!user?.id) return;
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('mentor_id', user.id)
        .eq('date', dateStr);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Update time slots with existing data
        const newTimeSlots = [...timeSlots];
        
        data.forEach(slot => {
          const index = newTimeSlots.findIndex(
            ts => ts.start_time === slot.start_time && ts.end_time === slot.end_time
          );
          
          if (index !== -1) {
            newTimeSlots[index] = {
              ...newTimeSlots[index],
              id: slot.id,
              selected: true
            };
          }
        });
        
        setTimeSlots(newTimeSlots);
      } else {
        // Reset time slots if no data exists for this date
        setTimeSlots(timeSlots.map(slot => ({ ...slot, id: undefined, selected: false })));
      }
      
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleTimeSlot = (index: number) => {
    const newTimeSlots = [...timeSlots];
    newTimeSlots[index] = {
      ...newTimeSlots[index],
      selected: !newTimeSlots[index].selected
    };
    setTimeSlots(newTimeSlots);
  };
  
  const saveAvailability = async () => {
    try {
      setLoading(true);
      if (!user?.id || !date) return;
      
      const dateStr = date.toISOString().split('T')[0];
      
      // First, get mentor ID
      const { data: mentorData, error: mentorError } = await supabase
        .from('mentors')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (mentorError) throw mentorError;
      const mentorId = mentorData.id;
      
      // Delete existing slots for this date
      const { error: deleteError } = await supabase
        .from('mentor_availability')
        .delete()
        .eq('mentor_id', mentorId)
        .eq('date', dateStr);
      
      if (deleteError) throw deleteError;
      
      // Insert selected time slots
      const selectedSlots = timeSlots.filter(slot => slot.selected);
      
      if (selectedSlots.length > 0) {
        const slotsToInsert = selectedSlots.map(slot => ({
          mentor_id: mentorId,
          date: dateStr,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_booked: false
        }));
        
        const { error: insertError } = await supabase
          .from('mentor_availability')
          .insert(slotsToInsert);
        
        if (insertError) throw insertError;
      }
      
      toast({
        title: "Availability saved",
        description: "Your availability has been updated successfully.",
      });
      
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Error saving availability",
        description: "There was a problem saving your availability. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <ProtectedRoute>
        <div>Loading...</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Schedule Your Availability</h1>
          <Link href="/mentorship/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {!isMentor ? (
          <Card>
            <CardHeader>
              <CardTitle>Not Registered as a Mentor</CardTitle>
              <CardDescription>
                You need to be an approved mentor to set your availability.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/mentorship/become-mentor">
                <Button>Become a Mentor</Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select a Date</CardTitle>
                <CardDescription>Choose a date to set your availability</CardDescription>
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

            <Card>
              <CardHeader>
                <CardTitle>Available Time Slots</CardTitle>
                <CardDescription>Select the times you are available for mentoring sessions on {date?.toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {timeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`slot-${index}`} 
                          checked={slot.selected}
                          onCheckedChange={() => toggleTimeSlot(index)}
                        />
                        <Label htmlFor={`slot-${index}`} className="flex-1">
                          {slot.start_time} - {slot.end_time}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={saveAvailability} disabled={loading} className="w-full">
                  {loading ? 'Saving...' : 'Save Availability'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 