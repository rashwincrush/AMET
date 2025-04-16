'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

type EventFormData = {
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
  is_published: boolean;
};

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [virtualMeetingLink, setVirtualMeetingLink] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      if (!params.id || !user) return;

      try {
        setLoading(true);
        setError(null);

        const { data: event, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          throw error;
        }

        if (!event) {
          throw new Error('Event not found');
        }

        // Check if user is the creator
        if (event.creator_id !== user.id) {
          setIsCreator(false);
          throw new Error('You do not have permission to edit this event');
        }

        setIsCreator(true);

        // Parse dates
        const startDateTime = new Date(event.start_date);
        const endDateTime = new Date(event.end_date);

        // Format dates for form inputs
        const formatDateForInput = (date: Date) => {
          return date.toISOString().split('T')[0];
        };

        const formatTimeForInput = (date: Date) => {
          return date.toTimeString().substring(0, 5);
        };

        // Set form state
        setTitle(event.title);
        setDescription(event.description);
        setLocation(event.location);
        setIsVirtual(event.is_virtual);
        setVirtualMeetingLink(event.virtual_meeting_link || '');
        setStartDate(formatDateForInput(startDateTime));
        setStartTime(formatTimeForInput(startDateTime));
        setEndDate(formatDateForInput(endDateTime));
        setEndTime(formatTimeForInput(endDateTime));
        setMaxAttendees(event.max_attendees ? event.max_attendees.toString() : '');
        setImageUrl(event.image_url || '');
        setIsPublished(event.is_published);

      } catch (err: any) {
        console.error('Error loading event:', err);
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [params.id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate form
    if (!title || !description || !startDate || !startTime || !endDate || !endTime) {
      setError('Please fill in all required fields');
      return;
    }

    if (isVirtual && !virtualMeetingLink) {
      setError('Virtual meeting link is required for virtual events');
      return;
    }

    // Combine date and time
    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${endDate}T${endTime}:00`);

    // Validate dates
    if (endDateTime <= startDateTime) {
      setError('End date/time must be after start date/time');
      return;
    }

    try {
      setSubmitting(true);

      const eventData = {
        title,
        description,
        location: isVirtual ? 'Virtual' : location,
        is_virtual: isVirtual,
        virtual_meeting_link: isVirtual ? virtualMeetingLink : null,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
        image_url: imageUrl || null,
        is_published: isPublished
      };

      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', params.id);

      if (error) {
        throw error;
      }

      setSuccess('Event updated successfully!');
      
      // Redirect to event page after a short delay
      setTimeout(() => {
        router.push(`/events/${params.id}`);
      }, 1500);
      
    } catch (err: any) {
      console.error('Error updating event:', err);
      setError(err.message || 'An error occurred while updating the event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href={`/events/${params.id}`}>
            <Button variant="outline">← Back to Event</Button>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">Edit Event</h1>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error && !isCreator ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <div className="mt-4">
              <Link href="/events">
                <Button>Back to Events</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
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
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-md h-32"
                  required
                />
              </div>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isVirtual"
                  checked={isVirtual}
                  onChange={(e) => setIsVirtual(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="isVirtual" className="text-sm font-medium text-gray-700">
                  This is a virtual event
                </label>
              </div>
              
              {isVirtual ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Virtual Meeting Link *
                  </label>
                  <input
                    type="url"
                    value={virtualMeetingLink}
                    onChange={(e) => setVirtualMeetingLink(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="https://zoom.us/j/..."
                    required={isVirtual}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Building name, address, etc."
                    required={!isVirtual}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Attendees
                </label>
                <input
                  type="number"
                  value={maxAttendees}
                  onChange={(e) => setMaxAttendees(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  min="1"
                  placeholder="Leave blank for unlimited"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                  Publish this event
                </label>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/events/${params.id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Update Event'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};