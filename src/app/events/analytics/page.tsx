'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

type EventAnalytics = {
  totalEvents: number;
  totalAttendees: number;
  averageAttendance: number;
  upcomingEvents: number;
  pastEvents: number;
  mostPopularEvents: Array<{
    id: string;
    title: string;
    attendeeCount: number;
  }>;
  monthlyEventCounts: Array<{
    month: string;
    count: number;
  }>;
  registrationsByEvent: Array<{
    id: string;
    title: string;
    registered: number;
    attended: number;
    cancelled: number;
  }>;
};

function PageClient() {
  const router = useRouter();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'month', 'year'

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);

        // Get all events
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('id, title, start_date, end_date');

        if (eventsError) throw eventsError;

        // Get all event attendees
        const { data: attendees, error: attendeesError } = await supabase
          .from('event_attendees')
          .select('event_id, status');

        if (attendeesError) throw attendeesError;

        // Calculate analytics
        const now = new Date();
        const pastEvents = events?.filter(event => new Date(event.end_date) < now) || [];
        const upcomingEvents = events?.filter(event => new Date(event.end_date) >= now) || [];

        // Calculate monthly event counts
        const monthlyData: Record<string, number> = {};
        events?.forEach(event => {
          const date = new Date(event.start_date);
          const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
          monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
        });

        const monthlyEventCounts = Object.entries(monthlyData).map(([month, count]) => {
          const [year, monthNum] = month.split('-');
          return {
            month: `${new Date(0, parseInt(monthNum) - 1).toLocaleString('default', { month: 'short' })} ${year}`,
            count
          };
        }).sort((a, b) => a.month.localeCompare(b.month));

        // Calculate registrations by event
        const registrationsByEvent = events?.map(event => {
          const eventAttendees = attendees?.filter(a => a.event_id === event.id) || [];
          return {
            id: event.id,
            title: event.title,
            registered: eventAttendees.filter(a => a.status === 'registered').length,
            attended: eventAttendees.filter(a => a.status === 'attended').length,
            cancelled: eventAttendees.filter(a => a.status === 'cancelled').length
          };
        }).sort((a, b) => (b.registered + b.attended) - (a.registered + a.attended)) || [];

        // Calculate most popular events
        const mostPopularEvents = registrationsByEvent
          .slice(0, 5)
          .map(event => ({
            id: event.id,
            title: event.title,
            attendeeCount: event.registered + event.attended
          }));

        setAnalytics({
          totalEvents: events?.length || 0,
          totalAttendees: attendees?.filter(a => a.status !== 'cancelled').length || 0,
          averageAttendance: pastEvents.length > 0 
            ? Math.round((attendees?.filter(a => a.status === 'attended').length || 0) / pastEvents.length) 
            : 0,
          upcomingEvents: upcomingEvents.length,
          pastEvents: pastEvents.length,
          mostPopularEvents,
          monthlyEventCounts,
          registrationsByEvent: registrationsByEvent.slice(0, 10) // Top 10 events
        });
      } catch (err: any) {
        console.error('Error loading analytics:', err);
        setError('Failed to load event analytics. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [timeRange]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Event Analytics</h1>
        <div className="flex space-x-2">
          <Link href="/events">
            <Button variant="outline">Back to Events</Button>
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2">
          <Button 
            variant={timeRange === 'all' ? 'default' : 'outline'}
            onClick={() => setTimeRange('all')}
            className={`border ${timeRange === 'all' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            All Time
          </Button>
          <Button 
            variant={timeRange === 'year' ? 'default' : 'outline'}
            onClick={() => setTimeRange('year')}
            className={`border ${timeRange === 'year' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Past Year
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
            className={`border ${timeRange === 'month' ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Past Month
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : analytics ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Events</h3>
              <p className="text-3xl font-bold text-primary-600">{analytics.totalEvents}</p>
              <div className="text-sm text-gray-500 mt-2">
                {analytics.upcomingEvents} upcoming, {analytics.pastEvents} past
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Attendees</h3>
              <p className="text-3xl font-bold text-green-600">{analytics.totalAttendees}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Average Attendance</h3>
              <p className="text-3xl font-bold text-purple-600">{analytics.averageAttendance}</p>
              <div className="text-sm text-gray-500 mt-2">per event</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Attendance Rate</h3>
              <p className="text-3xl font-bold text-orange-600">
                {analytics.totalAttendees > 0 
                  ? Math.round((analytics.registrationsByEvent.reduce((sum, event) => sum + event.attended, 0) / 
                     analytics.totalAttendees) * 100) 
                  : 0}%
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Most Popular Events</h3>
              {analytics.mostPopularEvents.length > 0 ? (
                <ul className="divide-y">
                  {analytics.mostPopularEvents.map((event) => (
                    <li key={event.id} className="py-3">
                      <div className="flex justify-between">
                        <Link href={`/events/${event.id}`} className="text-primary-600 hover:underline">
                          {event.title}
                        </Link>
                        <span className="font-semibold">{event.attendeeCount} attendees</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No event data available</p>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Monthly Event Counts</h3>
              {analytics.monthlyEventCounts.length > 0 ? (
                <div className="h-64">
                  <div className="flex h-full items-end">
                    {analytics.monthlyEventCounts.map((item, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-primary-500 rounded-t" 
                          style={{ 
                            height: `${(item.count / Math.max(...analytics.monthlyEventCounts.map(i => i.count))) * 100}%`,
                            minHeight: '10px'
                          }}
                        ></div>
                        <div className="text-xs mt-2 transform -rotate-45 origin-top-left">{item.month}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No monthly data available</p>
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4">Registration Details by Event</h3>
            {analytics.registrationsByEvent.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attended</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cancelled</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.registrationsByEvent.map((event) => (
                      <tr key={event.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/events/${event.id}`} className="text-primary-600 hover:underline">
                            {event.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{event.registered}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{event.attended}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{event.cancelled}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {event.registered > 0 
                            ? `${Math.round((event.attended / (event.registered + event.attended)) * 100)}%` 
                            : '0%'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No registration data available</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function EventAnalyticsPage() {
  return <PageClient />;
}