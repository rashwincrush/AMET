import { supabase } from '@/lib/supabase';
import { Event, EventAttendee } from '@/types/database';

export const eventService = {
  // Get all events
  async getAllEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    return data as Event[];
  },
  
  // Get upcoming events
  async getUpcomingEvents(limit = 5) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('start_date', now)
      .is('is_published', true)
      .order('start_date', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data as Event[];
  },
  
  // Get event by ID
  async getEventById(id: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Event;
  },
  
  // Create a new event
  async createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();
    
    if (error) throw error;
    return data as Event;
  },
  
  // Update an event
  async updateEvent(id: string, updates: Partial<Event>) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Event;
  },
  
  // Delete an event
  async deleteEvent(id: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
  
  // Register for an event
  async registerForEvent(eventId: string, profileId: string) {
    const { data, error } = await supabase
      .from('event_attendees')
      .insert([
        {
          event_id: eventId,
          profile_id: profileId,
          status: 'registered'
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data as EventAttendee;
  },
  
  // Get event attendees
  async getEventAttendees(eventId: string) {
    const { data, error } = await supabase
      .from('event_attendees')
      .select(`
        *,
        profiles:profile_id (id, first_name, last_name, email, avatar_url)
      `)
      .eq('event_id', eventId);
    
    if (error) throw error;
    return data;
  },
  
  // Update attendance status
  async updateAttendanceStatus(attendeeId: string, status: 'registered' | 'attended' | 'cancelled') {
    const { data, error } = await supabase
      .from('event_attendees')
      .update({ status })
      .eq('id', attendeeId)
      .select()
      .single();
    
    if (error) throw error;
    return data as EventAttendee;
  }
}; 