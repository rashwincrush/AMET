'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  is_virtual: boolean;
  start_date: string;
  end_date: string;
  creator_id: string;
};

type EventReminder = {
  id: string;
  event_id: string;
  user_id: string;
  reminder_time: string;
  is_sent: boolean;
  created_at: string;
  event: Event;
};

export default function EventRemindersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [reminders, setReminders] = useState<EventReminder[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);

        // Load user's reminders
        const { data: remindersData, error: remindersError } = await supabase
          .from('event_reminders')
          .select(`
            *,
            event:event_id(*)
          `)
          .eq('user_id', user.id)
          .order('reminder_time', { ascending: true });

        if (remindersError) throw remindersError;
        setReminders(remindersData || []);

        // Load upcoming events without reminders
        const now = new Date().toISOString();
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('is_published', true)
          .gte('start_date', now)
          .order('start_date', { ascending: true });

        if (eventsError) throw eventsError;
        
        // Filter out events that already have reminders
        const reminderEventIds = remindersData?.map(r => r.event_id) || [];
        const eventsWithoutReminders = eventsData?.filter(event => 
          !reminderEventIds.includes(event.id)
        ) || [];
        
        setUpcomingEvents(eventsWithoutReminders);
      } catch (err: any) {
        console.error('Error loading reminders:', err);
        setError('Failed to load reminders. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const handleCreateReminder = async (eventId: string, reminderTime: string) => {
    if (!user) return;
    
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      
      const { data, error } = await supabase
        .from('event_reminders')
        .insert([
          {
            event_id: eventId,
            user_id: user.id,
            reminder_time: reminderTime,
            is_sent: false
          }
        ])
        .select(`
          *,
          event:event_id(*)
        `);

      if (error) throw error;
      
      // Update local state
      if (data && data.length > 0) {
        setReminders(prev => [...prev, data[0]]);
        setUpcomingEvents(prev => prev.filter(event => event.id !== eventId));
      }
      
      setSuccess('Reminder set successfully!');
    } catch (err: any) {
      console.error('Error setting reminder:', err);
      setError('Failed to set reminder. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReminder = async (reminderId: string, eventId: string) => {
    if (!user) return;
    
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      
      const { error } = await supabase
        .from('event_reminders')
        .delete()
        .eq('id', reminderId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Get the event details to add back to upcoming events
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
        
      if (eventError) throw eventError;
      
      // Update local state
      setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
      
      // Only add back to upcoming events if it's still in the future
      const now = new Date();
      const eventDate = new Date(eventData.start_date);
      if (eventDate > now) {
        setUpcomingEvents(prev => [...prev, eventData]);
      }
      
      setSuccess('Reminder deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting reminder:', err);
      setError('Failed to delete reminder. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate reminder options (1 hour, 1 day, 1 week before)
  const getReminderOptions = (eventDate: string) => {
    const startDate = new Date(eventDate);
    const now = new Date();
    
    const oneHourBefore = new Date(startDate.getTime() - 60 * 60 * 1000);
    const oneDayBefore = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekBefore = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const options = [];
    
    if (oneHourBefore > now) {
      options.push({
        label: '1 hour before',
        value: oneHourBefore.toISOString()
      });
    }
    
    if (oneDayBefore > now) {
      options.push({
        label: '1 day before',
        value: oneDayBefore.toISOString()
      });
    }
    
    if (oneWeekBefore > now) {
      options.push({
        label: '1 week before',
        value: oneWeekBefore.toISOString()
      });
    }
    
    return options;
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Event Reminders</h1>
          <Link href="/events">
            <Button variant="outline">
              Back to Events
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
          <h3 className="font-bold text-lg">How to Add Reminders</h3>
          <p>Reminders are automatically set for upcoming events. Just select "Remind me" with your preferred timing from the options below for any upcoming event.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Your Reminders</h2>
                {reminders.length === 0 ? (
                  <p className="text-gray-500">You don't have any event reminders set.</p>
                ) : (
                  <div className="space-y-4">
                    {reminders.map((reminder) => (
                      <div key={reminder.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">{reminder.event.title}</h3>
                            <p className="text-gray-600 mb-1">
                              <span className="font-medium">Event:</span> {formatDate(reminder.event.start_date)}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Reminder:</span> {formatDate(reminder.reminder_time)}
                            </p>
                          </div>
                          <div className="mt-4 md:mt-0">
                            <Button 
                              variant="outline" 
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteReminder(reminder.id, reminder.event_id)}
                              disabled={actionLoading}
                            >
                              Remove Reminder
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
                {upcomingEvents.length === 0 ? (
                  <p className="text-gray-500">No upcoming events without reminders.</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => {
                      const reminderOptions = getReminderOptions(event.start_date);
                      return (
                        <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">{event.title}</h3>
                              <p className="text-gray-600 mb-1">
                                <span className="font-medium">When:</span> {formatDate(event.start_date)}
                              </p>
                              <p className="text-gray-600">
                                <span className="font-medium">Where:</span> {event.is_virtual ? 'Virtual Event' : event.location}
                              </p>
                            </div>
                            <div className="mt-4 md:mt-0">
                              {reminderOptions.length > 0 ? (
                                <div className="flex flex-col space-y-2">
                                  {reminderOptions.map((option) => (
                                    <Button 
                                      key={option.value}
                                      onClick={() => handleCreateReminder(event.id, option.value)}
                                      disabled={actionLoading}
                                      variant="outline"
                                      className="whitespace-nowrap bg-blue-50 border-blue-300 hover:bg-blue-100 text-blue-700"
                                    >
                                      Remind me {option.label}
                                    </Button>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">Event too soon for reminders</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}