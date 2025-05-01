'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, Grid3x3, List, MapPin, Clock, Plus, RefreshCw, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import PublicPageWrapper from '@/components/auth/PublicPageWrapper';

// Define the Event type
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
  category: string;
  status: 'upcoming' | 'past' | 'ongoing';
};

// Mock marine-themed events with past and future dates
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Ocean Conservation Summit',
    description: 'Join marine biologists and conservationists for a comprehensive discussion on protecting our oceans. The summit will feature keynote speeches, interactive workshops, and networking opportunities with leaders in marine conservation.',
    location: 'Miami Marine Research Center',
    is_virtual: false,
    start_date: '2025-06-15T09:00:00Z',
    end_date: '2025-06-15T17:00:00Z',
    max_attendees: 250,
    image_url: 'https://images.unsplash.com/photo-1518399681705-1c1a55e5e883',
    creator_id: 'user123',
    created_at: '2025-01-10T12:00:00Z',
    category: 'Conference',
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Coral Reef Restoration Workshop',
    description: 'A hands-on workshop focused on coral reef restoration techniques. Learn about the latest methods in coral propagation, transplantation, and monitoring from experts who have successfully restored reef systems worldwide.',
    location: 'Key West Marine Laboratory',
    is_virtual: false,
    start_date: '2025-05-20T10:00:00Z',
    end_date: '2025-05-20T16:00:00Z',
    max_attendees: 50,
    image_url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b',
    creator_id: 'user456',
    created_at: '2025-02-15T14:30:00Z',
    category: 'Workshop',
    status: 'upcoming'
  },
  {
    id: '3',
    title: 'Virtual Dive: Deep Sea Exploration',
    description: 'Experience the wonders of the deep sea from the comfort of your home. This virtual event will take you on a journey to the unexplored depths of our oceans with live commentary from marine scientists.',
    location: 'Online',
    is_virtual: true,
    virtual_meeting_link: 'https://zoom.us/j/123456789',
    start_date: '2025-05-05T18:00:00Z',
    end_date: '2025-05-05T20:00:00Z',
    max_attendees: 1000,
    image_url: 'https://images.unsplash.com/photo-1551244072-5d12893278ab',
    creator_id: 'user789',
    created_at: '2025-03-01T09:15:00Z',
    category: 'Social',
    status: 'upcoming'
  },
  {
    id: '4',
    title: 'Marine Biology Career Fair',
    description: 'Connect with potential employers in marine sciences. Representatives from research institutions, conservation organizations, and educational facilities will be present to discuss career opportunities.',
    location: 'San Diego Oceanographic Institute',
    is_virtual: false,
    start_date: '2025-07-10T10:00:00Z',
    end_date: '2025-07-10T16:00:00Z',
    max_attendees: 300,
    image_url: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0',
    creator_id: 'user101',
    created_at: '2025-03-20T11:45:00Z',
    category: 'Career Fair',
    status: 'upcoming'
  },
  {
    id: '5',
    title: 'Plastic Pollution Hackathon',
    description: 'A weekend-long event bringing together engineers, designers, and environmentalists to develop innovative solutions to marine plastic pollution. Past winners have gone on to secure funding for their projects.',
    location: 'Seattle Innovation Hub',
    is_virtual: false,
    start_date: '2024-12-05T09:00:00Z', // Past event
    end_date: '2024-12-06T17:00:00Z',
    max_attendees: 150,
    image_url: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f',
    creator_id: 'user202',
    created_at: '2024-10-15T10:00:00Z',
    category: 'Workshop',
    status: 'past'
  },
  {
    id: '6',
    title: 'Annual Marine Science Symposium',
    description: 'Our flagship event featuring the latest research in marine sciences. The symposium includes poster presentations, oral sessions, and opportunities for researchers to collaborate on future projects.',
    location: 'Boston University Marine Research Center',
    is_virtual: false,
    start_date: '2024-11-20T08:30:00Z', // Past event
    end_date: '2024-11-22T16:00:00Z',
    max_attendees: 400,
    image_url: 'https://images.unsplash.com/photo-1501436513145-30f24e19fcc8',
    creator_id: 'user303',
    created_at: '2024-09-01T13:20:00Z',
    category: 'Conference',
    status: 'past'
  }
];

// Marine-specific event categories for filtering
const EVENT_CATEGORIES = [
  'All Events',
  'Ocean Conservation',
  'Marine Research',
  'Aquatic Biology',
  'Environmental Science',
  'Career Development',
  'Networking',
  'Workshop',
  'Conference',
  'Social'
];

// Event status options for filtering
const EVENT_STATUS_OPTIONS = [
  'All Events',
  'Upcoming',
  'Past'
];

export default function EventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Events');
  const [selectedStatus, setSelectedStatus] = useState('All Events');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  useEffect(() => {
    // Simulate loading events from an API
    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);
        
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Set mock events
        setEvents(MOCK_EVENTS);
      } catch (err: any) {
        console.error('Error loading events:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  // Retry loading events if there was an error
  const handleRetry = () => {
    loadEvents();
  };

  // Function to load events (extracted from useEffect for reuse)
  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Set mock events
      setEvents(MOCK_EVENTS);
    } catch (err: any) {
      console.error('Error loading events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Filter events based on search term, category, and status
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All Events' || 
      event.category === selectedCategory;
    
    const matchesStatus = selectedStatus === 'All Events' || 
      event.status === selectedStatus.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Format date for display with proper timezone handling
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  };

  // Calculate days from now with proper handling of past events
  const getDaysFromNow = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  // Featured marine events section
  const FeaturedMarineEvents = () => {
    // Get featured marine events (upcoming with high priority)
    const featuredEvents = events
      .filter(event => 
        new Date(event.start_date) > new Date() &&
        ['Ocean Conservation', 'Marine Research', 'Aquatic Biology'].includes(event.category)
      )
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 3);
    
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-lg mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-blue-800">Featured Marine Events</h2>
          <Link href="/events" className="text-blue-600 hover:text-blue-800 font-medium">
            View All
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
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
                  <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
                    {getDaysFromNow(event.start_date)}
                  </div>
                  {['Ocean Conservation', 'Marine Research', 'Aquatic Biology'].includes(event.category) && (
                    <div className="absolute top-3 left-3 bg-blue-600 text-white rounded-full px-3 py-1 text-xs">
                      Marine Science Focus
                    </div>
                  )}
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
            <p className="text-gray-500">No featured marine events available.</p>
          </div>
        )}
      </div>
    );
  };

  // Filter component
  const FilterPanel = () => (
    <div className={`transition-all duration-300 overflow-hidden ${isFilterOpen ? 'max-h-96' : 'max-h-0'}`}>
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
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
          <div>
            <h3 className="font-medium mb-3">Filter by Status</h3>
            <div className="flex flex-wrap gap-2">
              {EVENT_STATUS_OPTIONS.map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
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
            {event.status === 'past' && (
              <div className="absolute bottom-3 right-3 bg-gray-800 text-white rounded-full px-3 py-1 text-xs font-semibold">
                Past Event
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
                    {event.status === 'past' && (
                      <span className="text-xs px-2 py-1 bg-gray-800 text-white rounded-full">
                        Past Event
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
            setSelectedStatus('All Events');
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

  // Error component with retry button
  const ErrorDisplay = () => (
    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-6 rounded-lg mb-4 text-center">
      <p className="mb-4">{error}</p>
      <Button 
        onClick={handleRetry}
        variant="outline"
        className="flex items-center"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  );

  // Main events content
  const EventsContent = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="md:flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Marine Science Events</h1>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Explore Marine Opportunities
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/events/reminders">
            <Button variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-1" />
              My Reminders
            </Button>
          </Link>
          <Link href="/events/calendar">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-1" />
              Calendar View
            </Button>
          </Link>
          <Link href="/events/create">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex items-center">
              <Plus className="h-4 w-4 mr-1" />
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
              placeholder="Search marine events by title, description or location..."
              className="w-full p-3 pl-10 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
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

      <FeaturedMarineEvents />

      <FilterPanel />

      {/* Active filters display */}
      {(selectedCategory !== 'All Events' || selectedStatus !== 'All Events') && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Filtered by:</span>
          {selectedCategory !== 'All Events' && (
            <span className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium inline-flex items-center">
              <span>{selectedCategory}</span>
              <button
                onClick={() => setSelectedCategory('All Events')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {selectedStatus !== 'All Events' && (
            <span className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium inline-flex items-center">
              <span>{selectedStatus}</span>
              <button
                onClick={() => setSelectedStatus('All Events')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <NoEventsFound />
      ) : viewMode === 'grid' ? (
        <GridView />
      ) : (
        <ListView />
      )}
      {(selectedCategory !== 'All Events' || selectedStatus !== 'All Events') && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Filtered by:</span>
          {selectedCategory !== 'All Events' && (
            <span className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium inline-flex items-center">
              Category: {selectedCategory}
              <button 
                onClick={() => setSelectedCategory('All Events')}
                className="ml-1 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
          {selectedStatus !== 'All Events' && (
            <span className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium inline-flex items-center">
              Status: {selectedStatus}
              <button 
                onClick={() => setSelectedStatus('All Events')}
                className="ml-1 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
          <button 
            onClick={() => {
              setSelectedCategory('All Events');
              setSelectedStatus('All Events');
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <ErrorDisplay />
      ) : filteredEvents.length === 0 ? (
        <NoEventsFound />
      ) : (
        viewMode === 'grid' ? <GridView /> : <ListView />
      )}
    </div>
  );

  return (
    <PublicPageWrapper
      title="Marine Science Events"
      description="Connect with fellow marine scientists at our exclusive events, workshops, and networking opportunities focused on ocean conservation and research."
      ctaText="Sign in or create an account to access event registration and receive notifications about upcoming marine science events."
      stats={[
        { value: "50+", label: "Events per Year" },
        { value: "5K+", label: "Attendees" },
        { value: "100+", label: "Marine Experts" },
        { value: "85%", label: "Research Collaboration Success" }
      ]}
      previewComponent={<FeaturedMarineEvents />}
    >
      <EventsContent />
    </PublicPageWrapper>
  );
}