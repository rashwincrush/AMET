'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    location: '',
    is_virtual: false,
    virtual_meeting_link: '',
    max_attendees: '',
    registration_deadline: '',
    event_type: 'networking', // Default event type
    is_featured: false,
    image_url: '',
    agenda: '',
    cost: '',
    sponsors: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    if (!user) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `event-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `event-images/${fileName}`;
    
    try {
      setUploadingImage(true);
      
      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('events')
        .getPublicUrl(filePath);
        
      if (data) {
        setFormData(prevData => ({
          ...prevData,
          image_url: data.publicUrl
        }));
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload event image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!formData.title || !formData.description || !formData.start_date) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Combine date and time
      const startDateTime = formData.start_time 
        ? `${formData.start_date}T${formData.start_time}:00` 
        : `${formData.start_date}T00:00:00`;
        
      const endDateTime = formData.end_date
        ? (formData.end_time 
          ? `${formData.end_date}T${formData.end_time}:00` 
          : `${formData.end_date}T23:59:59`)
        : startDateTime;
      
      // Create event in database
      const { data, error: createError } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          start_date: startDateTime,
          end_date: endDateTime,
          location: formData.location,
          is_virtual: formData.is_virtual,
          virtual_meeting_link: formData.virtual_meeting_link,
          max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
          registration_deadline: formData.registration_deadline || null,
          event_type: formData.event_type,
          is_featured: formData.is_featured,
          image_url: formData.image_url,
          agenda: formData.agenda,
          cost: formData.cost,
          sponsors: formData.sponsors,
          created_by: user.id,
          created_at: new Date().toISOString(),
          is_published: false // Events require approval before publishing
        })
        .select();
        
      if (createError) throw createError;
      
      setSuccess(true);
      
      // Redirect to event page after a delay
      setTimeout(() => {
        router.push('/events');
      }, 1500);
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Event</h3>
              <p className="mt-1 text-sm text-gray-600">
                Host an event for alumni to connect, learn, and network.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Note: All events require approval before they are published.
              </p>
            </div>
          </div>
          
          <div className="mt-5 md:mt-0 md:col-span-2">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-green-700">Event created successfully! It will be reviewed by an admin before publishing.</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  {/* Event Details */}
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Event Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Event Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="col-span-6">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        required
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="col-span-6">
                      <label htmlFor="agenda" className="block text-sm font-medium text-gray-700">
                        Agenda/Schedule
                      </label>
                      <textarea
                        id="agenda"
                        name="agenda"
                        rows={4}
                        value={formData.agenda}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="Detailed agenda or schedule for the event. Format: 10:00 AM - Welcome, 10:30 AM - Keynote, etc."
                      />
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="event_type" className="block text-sm font-medium text-gray-700">
                        Event Type
                      </label>
                      <select
                        id="event_type"
                        name="event_type"
                        value={formData.event_type}
                        onChange={handleChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="networking">Networking</option>
                        <option value="workshop">Workshop</option>
                        <option value="seminar">Seminar</option>
                        <option value="reunion">Reunion</option>
                        <option value="career_fair">Career Fair</option>
                        <option value="social">Social Gathering</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                        Event Image
                      </label>
                      <div className="mt-1 flex items-center">
                        {formData.image_url ? (
                          <div className="relative">
                            <img 
                              src={formData.image_url} 
                              alt="Event preview" 
                              className="h-32 w-auto object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, image_url: ''})}
                              className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-100 text-red-600 rounded-full p-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <input
                              type="file"
                              id="image"
                              name="image"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="sr-only"
                            />
                            <label
                              htmlFor="image"
                              className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              {uploadingImage ? 'Uploading...' : 'Upload Image'}
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Date and Time */}
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Date and Time</h3>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        id="start_date"
                        required
                        value={formData.start_date}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="start_time"
                        id="start_time"
                        value={formData.start_time}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="end_date"
                        id="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        min={formData.start_date}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                        End Time
                      </label>
                      <input
                        type="time"
                        name="end_time"
                        id="end_time"
                        value={formData.end_time}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="registration_deadline" className="block text-sm font-medium text-gray-700">
                        Registration Deadline
                      </label>
                      <input
                        type="date"
                        name="registration_deadline"
                        id="registration_deadline"
                        value={formData.registration_deadline}
                        onChange={handleChange}
                        max={formData.start_date}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="max_attendees" className="block text-sm font-medium text-gray-700">
                        Maximum Attendees
                      </label>
                      <input
                        type="number"
                        name="max_attendees"
                        id="max_attendees"
                        min="1"
                        value={formData.max_attendees}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
                        Cost (if applicable)
                      </label>
                      <input
                        type="text"
                        name="cost"
                        id="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        placeholder="e.g., Free, $10, $25-$50"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="col-span-6">
                      <label htmlFor="sponsors" className="block text-sm font-medium text-gray-700">
                        Sponsors (if applicable)
                      </label>
                      <textarea
                        id="sponsors"
                        name="sponsors"
                        rows={2}
                        value={formData.sponsors}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="List of event sponsors. Format: Company Name, Company Name, etc."
                      />
                    </div>
                  </div>
                  
                  {/* Location */}
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Location</h3>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="is_virtual"
                            name="is_virtual"
                            type="checkbox"
                            checked={formData.is_virtual}
                            onChange={handleChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="is_virtual" className="font-medium text-gray-700">
                            Virtual Event
                          </label>
                          <p className="text-gray-500">
                            This event will be held online.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {formData.is_virtual ? (
                      <div className="col-span-6">
                        <label htmlFor="virtual_meeting_link" className="block text-sm font-medium text-gray-700">
                          Virtual Meeting Link
                        </label>
                        <input
                          type="url"
                          name="virtual_meeting_link"
                          id="virtual_meeting_link"
                          value={formData.virtual_meeting_link}
                          onChange={handleChange}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="https://zoom.us/j/example"
                        />
                      </div>
                    ) : (
                      <div className="col-span-6">
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                          Physical Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          id="location"
                          value={formData.location}
                          onChange={handleChange}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="Address, Building, Room, etc."
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Featured Event */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="is_featured"
                        name="is_featured"
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={handleChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="is_featured" className="font-medium text-gray-700">
                        Request Featured Status
                      </label>
                      <p className="text-gray-500">
                        Featured events appear prominently on the homepage and events listing.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/events')}
                    className="mr-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Event'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}