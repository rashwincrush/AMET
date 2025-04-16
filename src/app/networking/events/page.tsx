'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

type NetworkingEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  is_virtual: boolean;
  virtual_meeting_link?: string;
  start_date: string;
  end_date: string;
  max_attendees?: number;
  image_url?: string;
  creator_id: string;
  created_at: string;
  attendee_count: number;
  is_attending: boolean;
  event_type: 'networking';
};

export default function NetworkingEventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<NetworkingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);

        if (!user) return;

        // Get all networking events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('is_published', true)
          .eq('event_type', 'networking')
          .gte('end_date', new Date().toISOString())
          .order('start_date', { ascending: true });

        if (eventsError) throw eventsError;

        // Get user's event attendances
        const { data: attendances, error: attendancesError } = await supabase
          .from('event_attendees')
          .select('event_id, status')
          .eq('profile_id', user.id);

        if (attendancesError) throw attendancesError;

        // Get attendee counts for each event
        const attendeeCountPromises = eventsData?.map(async (event) => {
          const { count, error: countError } = await supabase
            .from('event_attendees')
            .select('id', { count: 'exact' })
            .eq('event_id', event.id)
            .neq('status', 'cancelled');

          if (countError) throw countError;

          return {
            eventId: event.id,
            count: count || 0
          };
        }) || [];

        const attendeeCounts = await Promise.all(attendeeCountPromises);
        const userAttendances = attendances?.reduce((acc, curr) => {
          acc[curr.event_id] = curr.status;
          return acc;
        }, {} as Record<string, string>) || {};

        // Combine data
        const enhancedEvents = eventsData?.map(event => ({
          ...event,
          attendee_count: attendeeCounts.find(ac => ac.eventId === event.id)?.count || 0,
          is_attending: userAttendances[event.id] === 'registered' || userAttendances[event.id] === 'attended'
        })) || [];

        setEvents(enhancedEvents as NetworkingEvent[]);
      } catch (err: any) {
        console.error('Error loading networking events:', err);
        setError('Failed to load networking events. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [user]);

  const handleRSVP = async (eventId: string) => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          profile_id: user.id,
          status: 'registered'
        });

      if (error) throw error;

      // Update local state
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, is_attending: true, attendee_count: event.attendee_count + 1 } 
            : event
        )
      );
    } catch (err: any) {
      console.error('Error RSVPing to event:', err);
      alert('Failed to RSVP to event. Please try again.');
    }
  };

  const handleCancelRSVP = async (eventId: string) => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('event_attendees')
        .update({ status: 'cancelled' })
        .eq('event_id', eventId)
        .eq('profile_id', user.id);

      if (error) throw error;

      // Update local state
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, is_attending: false, attendee_count: Math.max(0, event.attendee_count - 1) } 
            : event
        )
      );
    } catch (err: any) {
      console.error('Error cancelling RSVP:', err);
      alert('Failed to cancel RSVP. Please try again.');
    }
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Networking Events</h1>
          <div className="flex space-x-2">
            <Link href="/networking">
              <Button variant="outline">Back to Networking</Button>
            </Link>
            <Button onClick={() => router.push('/networking/events/create')}>
              Create Networking Event
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search networking events..."
            className="w-full p-3 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No networking events found</p>
            <Button onClick={() => router.push('/networking/events/create')}>
              Create the first networking event
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                {event.image_url ? (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={event.image_url} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">Networking</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">When:</span> {formatDate(event.start_date)}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Where:</span> {event.is_virtual ? 'Virtual Event' : event.location}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Attendees:</span> {event.attendee_count}
                    {event.max_attendees && ` / ${event.max_attendees}`}
                  </p>
                  <p className="text-gray-700 mb-4 line-clamp-3">{event.description}</p>
                  <div className="flex space-x-2">
                    <Link href={`/networking/events/${event.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">View Details</Button>
                    </Link>
                    {event.is_attending ? (
                      <Button 
                        variant="outline" 
                        className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => handleCancelRSVP(event.id)}
                      >
                        Cancel RSVP
                      </Button>
                    ) : (
                      <Button 
                        className="flex-1"
                        onClick={() => handleRSVP(event.id)}
                        disabled={event.max_attendees !== null && event.attendee_count >= event.max_attendees}
                      >
                        RSVP
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}