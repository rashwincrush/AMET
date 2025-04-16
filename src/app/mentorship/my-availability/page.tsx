'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface AvailabilitySlot {
  id?: string;
  mentor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked?: boolean;
}

export default function MentorAvailabilityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isMentor, setIsMentor] = useState(false);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [newSlotDialogOpen, setNewSlotDialogOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    start_time: '09:00',
    end_time: '10:00'
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkMentorStatus() {
      if (!user) {
        return;
      }

      try {
        const { data: mentor, error } = await supabase
          .from('mentors')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 = not found
            console.error('Error checking mentor status:', error);
            setError('Failed to check mentor status');
          }
          setIsMentor(false);
        } else {
          setIsMentor(true);
          setMentorId(mentor.id);
          fetchAvailability(mentor.id, date);
        }
      } catch (error) {
        console.error('Error checking mentor status:', error);
        setError('Failed to check mentor status');
      } finally {
        setIsLoading(false);
      }
    }

    checkMentorStatus();
  }, [user]);

  const fetchAvailability = async (mentorId: string, selectedDate: Date) => {
    try {
      setIsLoading(true);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('date', formattedDate);
        
      if (error) {
        throw error;
      }
      
      setAvailabilitySlots(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setError('Failed to fetch availability');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate && mentorId) {
      setDate(newDate);
      fetchAvailability(mentorId, newDate);
    }
  };

  const addAvailability = async () => {
    if (!mentorId) return;
    
    // Basic validation
    if (!newSlot.start_time || !newSlot.end_time) {
      toast.error("Please provide both start and end times");
      return;
    }
    
    // Check if start time is before end time
    if (newSlot.start_time >= newSlot.end_time) {
      toast.error("Start time must be before end time");
      return;
    }
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    try {
      const newAvailability: AvailabilitySlot = {
        mentor_id: mentorId,
        date: formattedDate,
        start_time: newSlot.start_time,
        end_time: newSlot.end_time,
      };
      
      const { data, error } = await supabase
        .from('mentor_availability')
        .insert(newAvailability)
        .select();
        
      if (error) {
        throw error;
      }
      
      setAvailabilitySlots([...availabilitySlots, data[0]]);
      setNewSlotDialogOpen(false);
      toast.success("Availability slot added successfully");
    } catch (error) {
      console.error('Error adding availability:', error);
      toast.error("Failed to add availability slot");
    }
  };

  const deleteAvailability = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('mentor_availability')
        .delete()
        .eq('id', slotId);
        
      if (error) {
        throw error;
      }
      
      setAvailabilitySlots(availabilitySlots.filter(slot => slot.id !== slotId));
      toast.success("Availability slot removed successfully");
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast.error("Failed to delete availability slot");
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Manage Your Availability</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : !isMentor ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This page is only available to mentors. Please register as a mentor first.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>Choose a date to manage your availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 border rounded-md">
                  <input 
                    type="date" 
                    value={format(date, 'yyyy-MM-dd')}
                    onChange={(e) => handleDateChange(new Date(e.target.value))}
                    className="w-full p-2 border rounded" 
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Available Time Slots</CardTitle>
                  <CardDescription>
                    For {format(date, 'MMMM d, yyyy')}
                  </CardDescription>
                </div>
                <Dialog open={newSlotDialogOpen} onOpenChange={setNewSlotDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Add Slot
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Availability</DialogTitle>
                      <DialogDescription>
                        Set your available time slot for {format(date, 'MMMM d, yyyy')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start-time">Start Time</Label>
                          <Input
                            id="start-time"
                            type="time"
                            value={newSlot.start_time}
                            onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-time">End Time</Label>
                          <Input
                            id="end-time"
                            type="time"
                            value={newSlot.end_time}
                            onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewSlotDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addAvailability}>
                        Add Slot
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {availabilitySlots.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No availability slots for this date. Add a new slot to get started.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-4 text-left">Start Time</th>
                          <th className="py-2 px-4 text-left">End Time</th>
                          <th className="py-2 px-4 text-left">Status</th>
                          <th className="py-2 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availabilitySlots.map((slot) => (
                          <tr key={slot.id} className="border-b">
                            <td className="py-2 px-4">{formatTime(slot.start_time)}</td>
                            <td className="py-2 px-4">{formatTime(slot.end_time)}</td>
                            <td className="py-2 px-4">
                              {slot.is_booked ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Booked
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Available
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => slot.id && deleteAvailability(slot.id)}
                                disabled={slot.is_booked}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Note: You cannot delete slots that are already booked by mentees.
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 