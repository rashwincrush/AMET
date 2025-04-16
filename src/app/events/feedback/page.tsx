'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function EventFeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams?.get('event_id');
  const { user } = useAuth();
  
  const [event, setEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    overall_satisfaction: 3, // Default to middle rating
    content_rating: 3,
    speaker_rating: 3,
    venue_rating: 3,
    networking_rating: 3,
    organization_rating: 3,
    what_worked_well: '',
    what_to_improve: '',
    future_events_interest: false,
    suggestions: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    async function loadEvent() {
      if (!eventId) {
        setError('No event specified');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get event details
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setEvent(data);
        } else {
          setError('Event not found');
        }
      } catch (err: any) {
        console.error('Error loading event:', err);
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    }
    
    loadEvent();
  }, [eventId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' || name.includes('rating')
          ? parseInt(value) 
          : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !eventId) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Submit feedback
      const { error: submitError } = await supabase
        .from('event_feedback')
        .insert({
          event_id: eventId,
          user_id: user.id,
          overall_satisfaction: formData.overall_satisfaction,
          content_rating: formData.content_rating,
          speaker_rating: formData.speaker_rating,
          venue_rating: formData.venue_rating,
          networking_rating: formData.networking_rating,
          organization_rating: formData.organization_rating,
          what_worked_well: formData.what_worked_well,
          what_to_improve: formData.what_to_improve,
          future_events_interest: formData.future_events_interest,
          suggestions: formData.suggestions,
          submitted_at: new Date().toISOString()
        });
        
      if (submitError) throw submitError;
      
      setSuccess(true);
      
      // Redirect after successful submission
      setTimeout(() => {
        router.push('/events');
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };
  
  const renderRatingInput = (name: string, label: string) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-2 flex items-center">
        <span className="text-sm text-gray-500 mr-2">Poor</span>
        {[1, 2, 3, 4, 5].map((value) => (
          <div key={value} className="mx-2">
            <input
              type="radio"
              id={`${name}_${value}`}
              name={name}
              value={value}
              checked={formData[name as keyof typeof formData] === value}
              onChange={handleChange}
              className="sr-only"
            />
            <label
              htmlFor={`${name}_${value}`}
              className={`inline-block h-8 w-8 rounded-full cursor-pointer flex items-center justify-center transition-colors ${
                formData[name as keyof typeof formData] === value
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {value}
            </label>
          </div>
        ))}
        <span className="text-sm text-gray-500 ml-2">Excellent</span>
      </div>
    </div>
  );
  
  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/events" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Events
          </Link>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            Event Feedback
          </h2>
          {event && (
            <p className="mt-1 text-lg text-gray-500">
              {event.title}
            </p>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Thank you for your feedback!</p>
            <p>Your response has been submitted successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Event Ratings</h3>
                  <div className="space-y-6">
                    {renderRatingInput('overall_satisfaction', 'Overall Satisfaction with the Event')}
                    {renderRatingInput('content_rating', 'Event Content')}
                    {renderRatingInput('speaker_rating', 'Speakers/Presenters')}
                    {renderRatingInput('venue_rating', 'Venue/Platform')}
                    {renderRatingInput('networking_rating', 'Networking Opportunities')}
                    {renderRatingInput('organization_rating', 'Event Organization')}
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your Feedback</h3>
                  
                  <div>
                    <label htmlFor="what_worked_well" className="block text-sm font-medium text-gray-700">
                      What worked well about this event?
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="what_worked_well"
                        name="what_worked_well"
                        rows={3}
                        value={formData.what_worked_well}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Please share positive aspects of the event"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label htmlFor="what_to_improve" className="block text-sm font-medium text-gray-700">
                      What could be improved?
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="what_to_improve"
                        name="what_to_improve"
                        rows={3}
                        value={formData.what_to_improve}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Please share areas for improvement"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="future_events_interest"
                          name="future_events_interest"
                          type="checkbox"
                          checked={formData.future_events_interest}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="future_events_interest" className="font-medium text-gray-700">
                          I am interested in attending similar events in the future
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label htmlFor="suggestions" className="block text-sm font-medium text-gray-700">
                      Suggestions for future events
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="suggestions"
                        name="suggestions"
                        rows={3}
                        value={formData.suggestions}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                        placeholder="What topics or formats would you like to see in future events?"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <Button
                type="button"
                variant="outline"
                className="mr-3"
                onClick={() => router.push('/events')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </ProtectedRoute>
  );
}