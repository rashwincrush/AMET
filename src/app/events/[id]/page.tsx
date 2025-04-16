'use client';

import { useState, useEffect } from 'react';
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
  virtual_meeting_link?: string;
  start_date: string;
  end_date: string;
  max_attendees?: number;
  current_attendees?: number;
  image_url?: string;
  creator_id: string;
  created_at: string;
  creator?: {
    first_name?: string;
    last_name?: string;
  };
};

type Attendee = {
  id: string;
  event_id: string;
  user_id: string;
  status: 'registered' | 'attended' | 'cancelled';
  created_at: string;
  user?: {
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
  };
};

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isAttending, setIsAttending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadEventDetails() {
      if (!params.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get event details
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*, creator:creator_id(first_name, last_name)')
          .eq('id', params.id)
          .single();
          
        if (eventError) throw eventError;
        
        if (eventData) {
          setEvent(eventData as Event);
          
          // Get attendees
          const { data: attendeesData, error: attendeesError } = await supabase
            .from('event_attendees')
            .select('*, user:user_id(first_name, last_name, profile_image_url)')
            .eq('event_id', params.id)
            .order('created_at', { ascending: false });
            
          if (attendeesError) throw attendeesError;
          
          if (attendeesData) {
            setAttendees(attendeesData as Attendee[]);
            
            // Check if current user is attending
            if (user) {
              const isUserAttending = attendeesData.some(
                attendee => attendee.user_id === user.id && attendee.status !== 'cancelled'
              );
              setIsAttending(isUserAttending);
            }
          }
        }
      } catch (err: any) {
        console.error('Error loading event details:', err);
        setError(err.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    }
    
    loadEventDetails();
  }, [params.id, user]);
  
  const handleRegister = async () => {
    if (!user || !event) return;
    
    try {
      setRegisterLoading(true);
      
      // Check if event is at capacity
      if (event.max_attendees && attendees.filter(a => a.status !== 'cancelled').length >= event.max_attendees) {
        setError('This event has reached its maximum capacity');
        return;
      }
      
      // Register for the event
      const { error: registerError } = await supabase
        .from('event_attendees')
        .insert({
          event_id: event.id,
          user_id: user.id,
          status: 'registered',
          created_at: new Date().toISOString()
        });
        
      if (registerError) throw registerError;
      
      // Update UI
      setIsAttending(true);
      
      // Reload attendees
      const { data: updatedAttendees, error: attendeesError } = await supabase
        .from('event_attendees')
        .select('*, user:user_id(first_name, last_name, profile_image_url)')
        .eq('event_id', event.id)
        .order('created_at', { ascending: false });
        
      if (attendeesError) throw attendeesError;
      
      if (updatedAttendees) {
        setAttendees(updatedAttendees as Attendee[]);
      }
    } catch (err: any) {
      console.error('Error registering for event:', err);
      setError(err.message || 'Failed to register for event');
    } finally {
      setRegisterLoading(false);
    }
  };
  
  const handleCancelRegistration = async () => {
    if (!user || !event) return;
    
    try {
      setRegisterLoading(true);
      
      // Find the user's registration
      const attendee = attendees.find(a => a.user_id === user.id && a.status !== 'cancelled');
      
      if (!attendee) {
        setError('You are not registered for this event');
        return;
      }
      
      // Update status to cancelled
      const { error: cancelError } = await supabase
        .from('event_attendees')
        .update({ status: 'cancelled' })
        .eq('id', attendee.id);
        
      if (cancelError) throw cancelError;
      
      // Update UI
      setIsAttending(false);
      
      // Reload attendees
      const { data: updatedAttendees, error: attendeesError } = await supabase
        .from('event_attendees')
        .select('*, user:user_id(first_name, last_name, profile_image_url)')
        .eq('event_id', event.id)
        .order('created_at', { ascending: false });
        
      if (attendeesError) throw attendeesError;
      
      if (updatedAttendees) {
        setAttendees(updatedAttendees as Attendee[]);
      }
    } catch (err: any) {
      console.error('Error cancelling registration:', err);
      setError(err.message || 'Failed to cancel registration');
    } finally {
      setRegisterLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : event ? (
          <div>
            <div className="mb-6">
              <Link href="/events">
                <Button variant="outline" className="mb-4">
                  ← Back to Events
                </Button>
              </Link>
              
              {user && event.creator_id === user.id && (
                <div className="flex space-x-2 mb-4">
                  <Link href={`/events/${event.id}/edit`}>
                    <Button variant="outline">Edit Event</Button>
                  </Link>
                </div>
              )}
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {event.image_url && (
                <div className="h-64 sm:h-96 w-full overflow-hidden">
                  <img 
                    src={event.image_url} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="px-4 py-5 sm:px-6">
                <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Organized by {event.creator?.first_name} {event.creator?.last_name}
                </p>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(event.start_date)}
                      {event.end_date && event.end_date !== event.start_date && (
                        <span> to {formatDate(event.end_date)}</span>
                      )}
                    </dd>
                  </div>
                  
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Time</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatTime(event.start_date)}
                      {event.end_date && (
                        <span> to {formatTime(event.end_date)}</span>
                      )}
                    </dd>
                  </div>
                  
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {event.is_virtual ? (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                            Virtual Event
                          </span>
                          {event.virtual_meeting_link && (
                            <a 
                              href={event.virtual_meeting_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Join Meeting
                            </a>
                          )}
                        </div>
                      ) : (
                        event.location
                      )}
                    </dd>
                  </div>
                  
                  {event.max_attendees && (
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Capacity</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {attendees.filter(a => a.status !== 'cancelled').length} / {event.max_attendees} registered
                      </dd>
                    </div>
                  )}
                  
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                      {event.description}
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
                {isAttending ? (
                  <div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">
                            You are registered for this event.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleCancelRegistration}
                      disabled={registerLoading}
                    >
                      {registerLoading ? 'Processing...' : 'Cancel Registration'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleRegister}
                    disabled={registerLoading || (event.max_attendees !== null && attendees.filter(a => a.status !== 'cancelled').length >= event.max_attendees)}
                  >
                    {registerLoading ? 'Processing...' : (
                      event.max_attendees !== null && attendees.filter(a => a.status !== 'cancelled').length >= event.max_attendees
                        ? 'Event Full'
                        : 'Register for Event'
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Attendees ({attendees.filter(a => a.status !== 'cancelled').length})</h2>
              
              {attendees.filter(a => a.status !== 'cancelled').length > 0 ? (
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {attendees
                    .filter(a => a.status !== 'cancelled')
                    .map((attendee) => (
                      <li key={attendee.id} className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200">
                        <div className="w-full flex items-center justify-between p-6 space-x-6">
                          <div className="flex-1 truncate">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-gray-900 text-sm font-medium truncate">
                                {attendee.user?.first_name} {attendee.user?.last_name}
                              </h3>
                            </div>
                          </div>
                          {attendee.user?.profile_image_url ? (
                            <img 
                              className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" 
                              src={attendee.user.profile_image_url} 
                              alt="" 
                            />
                          ) : (
                            <span className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-gray-500">No attendees yet. Be the first to register!</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Event not found</p>
            <Link href="/events">
              <Button>Back to Events</Button>
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}