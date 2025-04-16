'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, Grid3x3, List, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import PublicPageWrapper from '@/components/auth/PublicPageWrapper';

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
  image_url?: string;
  creator_id: string;
  created_at: string;
  category?: string;
};

// Event categories for filtering
const EVENT_CATEGORIES = [
  'All Events',
  'Networking',
  'Workshop',
  'Conference',
  'Career Fair',
  'Social',
  'Other'
];

export default function EventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Events');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('is_published', true)
          .gte('end_date', new Date().toISOString())
          .order('start_date', { ascending: true });

        if (error) {
          throw error;
        }

        setEvents(data || []);
      } catch (err: any) {
        console.error('Error loading events:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All Events' || 
      event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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

  // Calculate days from now
  const getDaysFromNow = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  // Featured events for public view
  const EventsPreview = () => {
    // Get upcoming events, limited to first 3
    const upcomingEvents = events.slice(0, 3);
    
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Upcoming Events</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg">
                <div className={`relative h-48 ${!event.image_url ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : ''}`}>
                  {event.image_url ? (
                    <img 
                      src={event.image_url} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">{event.title}</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-xs font-semibold text-blue-700">
                    {getDaysFromNow(event.start_date)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatDate(event.start_date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{event.is_virtual ? 'Virtual Event' : event.location}</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-4 bg-blue-50 p-2 rounded-md text-center">
                    Sign in to view details and register
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No upcoming events available for preview.</p>
          </div>
        )}
      </div>
    );
  };

  // Filter component
  const FilterPanel = () => (
    <div className={`transition-all duration-300 overflow-hidden ${isFilterOpen ? 'max-h-96' : 'max-h-0'}`}>
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-3">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          {EVENT_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-md text-sm ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Grid view for events
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredEvents.map((event) => (
        <div 
          key={event.id} 
          className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white"
        >
          <div className={`relative h-48 ${!event.image_url ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : ''}`}>
            {event.image_url ? (
              <img 
                src={event.image_url} 
                alt={event.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">{event.title}</span>
              </div>
            )}
            <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
              {getDaysFromNow(event.start_date)}
            </div>
            {event.category && (
              <div className="absolute top-3 left-3 bg-black bg-opacity-60 text-white rounded-full px-3 py-1 text-xs">
                {event.category}
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
            <div className="flex items-center text-gray-600 mb-2">
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatDate(event.start_date)}</span>
            </div>
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{event.is_virtual ? 'Virtual Event' : event.location}</span>
            </div>
            <p className="text-gray-700 mb-4 line-clamp-3">{event.description}</p>
            <Link href={`/events/${event.id}`}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );

  // List view for events
  const ListView = () => (
    <div className="space-y-4">
      {filteredEvents.map((event) => (
        <div 
          key={event.id} 
          className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-white p-4"
        >
          <div className="flex flex-col md:flex-row">
            <div className={`h-24 w-full md:w-48 flex-shrink-0 rounded-md overflow-hidden mb-4 md:mb-0 md:mr-4 ${!event.image_url ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : ''}`}>
              {event.image_url ? (
                <img 
                  src={event.image_url} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">{event.title}</span>
                </div>
              )}
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  <div className="flex flex-wrap gap-y-1 gap-x-4 mb-2">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">{formatDate(event.start_date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{event.is_virtual ? 'Virtual Event' : event.location}</span>
                    </div>
                    {event.category && (
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {event.category}
                      </span>
                    )}
                  </div>
                </div>
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-semibold">
                  {getDaysFromNow(event.start_date)}
                </span>
              </div>
              <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>
              <div className="flex justify-end">
                <Link href={`/events/${event.id}`}>
                  <Button 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // No events found component
  const NoEventsFound = () => (
    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
      <div className="mb-4 flex justify-center">
        <Calendar className="h-16 w-16 text-gray-300" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 mb-2">No events found</h3>
      <p className="text-gray-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
      <div className="flex justify-center gap-4">
        <button 
          onClick={() => {
            setSearchTerm('');
            setSelectedCategory('All Events');
          }}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear all filters
        </button>
        <Link href="/events/create">
          <Button>
            Create an event
          </Button>
        </Link>
      </div>
    </div>
  );

  // Main events content
  const EventsContent = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="md:flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Upcoming Events</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/events/reminders">
            <Button variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-1" />
              Reminders
            </Button>
          </Link>
          <Link href="/events/feedback">
            <Button variant="outline" size="sm">
              Feedback
            </Button>
          </Link>
          <Link href="/events/calendar">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-1" />
              Calendar
            </Button>
          </Link>
          <Link href="/events/create">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Create New Event
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search events by title, description or location..."
              className="w-full p-3 pl-10 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={isFilterOpen ? 'bg-blue-50 text-blue-600' : ''}
            >
              <Filter className="h-5 w-5" />
            </Button>
            <div className="flex rounded-md overflow-hidden border">
              <Button 
                variant="ghost" 
                size="icon"
                className={`rounded-none ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className={`rounded-none ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <FilterPanel />

      {selectedCategory !== 'All Events' && (
        <div className="mb-4 flex items-center">
          <span className="text-sm text-gray-500 mr-2">Filtered by:</span>
          <span className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium inline-flex items-center">
            {selectedCategory}
            <button 
              onClick={() => setSelectedCategory('All Events')}
              className="ml-1 hover:text-blue-900"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : filteredEvents.length === 0 ? (
        <NoEventsFound />
      ) : (
        viewMode === 'grid' ? <GridView /> : <ListView />
      )}
    </div>
  );

  return (
    <PublicPageWrapper
      title="Alumni Events"
      description="Connect with fellow alumni at our exclusive events, workshops, and networking opportunities."
      ctaText="Sign in or create an account to access event registration and receive notifications about upcoming events."
      stats={[
        { value: "50+", label: "Events per Year" },
        { value: "5K+", label: "Attendees" },
        { value: "100+", label: "Speakers" },
        { value: "85%", label: "Networking Success" }
      ]}
      previewComponent={<EventsPreview />}
    >
      <EventsContent />
    </PublicPageWrapper>
  );
}