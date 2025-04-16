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
  is_published: boolean;
};

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
};

export default function EventCalendarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  // Load events
  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);

        // Get the first and last day of the current month view
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        
        // Add buffer days to include events from the previous and next month that appear in the calendar view
        const firstDayOfCalendar = new Date(firstDay);
        firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDayOfCalendar.getDay());
        
        const lastDayOfCalendar = new Date(lastDay);
        const daysToAdd = 6 - lastDayOfCalendar.getDay();
        lastDayOfCalendar.setDate(lastDayOfCalendar.getDate() + daysToAdd);

        // Query events for the extended date range
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('is_published', true)
          .gte('start_date', firstDayOfCalendar.toISOString())
          .lte('start_date', lastDayOfCalendar.toISOString())
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
  }, [currentMonth]);

  // Generate calendar days
  useEffect(() => {
    const today = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get the first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    // Get the last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate total days to show (previous month + current month + next month)
    const totalDays = 42; // 6 rows of 7 days

    const days: CalendarDay[] = [];

    // Add days from previous month
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
      const date = new Date(year, month - 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        events: getEventsForDay(date)
      });
    }

    // Add days from current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        events: getEventsForDay(date)
      });
    }

    // Add days from next month to fill the calendar
    const remainingDays = totalDays - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        events: getEventsForDay(date)
      });
    }

    setCalendarDays(days);
  }, [currentMonth, events]);

  // Helper function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Helper function to get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return isSameDay(eventDate, date);
    });
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Navigate to current month
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Event Calendar</h1>
          <div className="flex space-x-2">
            <Link href="/events">
              <Button variant="outline">List View</Button>
            </Link>
            <Button 
              onClick={() => router.push('/events/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Event
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div>
              <Button variant="outline" onClick={goToPreviousMonth}>
                <span className="sr-only">Previous month</span>
                &larr;
              </Button>
            </div>
            <h2 className="text-xl font-semibold text-center">
              {formatDate(currentMonth)}
            </h2>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={goToCurrentMonth}>
                Today
              </Button>
              <Button variant="outline" onClick={goToNextMonth}>
                <span className="sr-only">Next month</span>
                &rarr;
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="border-t border-gray-200">
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="bg-gray-50 py-2 text-center text-sm font-semibold text-gray-700">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'} ${day.isToday ? 'bg-primary-50' : ''}`}
                  >
                    <div className="font-semibold text-sm mb-1">{day.date.getDate()}</div>
                    <div className="space-y-1 overflow-y-auto max-h-[80px]">
                      {day.events.map((event) => (
                        <Link
                          key={event.id}
                          href={`/events/${event.id}`}
                          className="block text-xs p-1 rounded truncate bg-primary-100 hover:bg-primary-200 text-primary-800"
                        >
                          {formatTime(event.start_date)} {event.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}