import { supabase } from '@/lib/supabase';

// This function tells Next.js which [id] values to generate at build time
export async function generateStaticParams() {
  try {
    // Fetch published events from Supabase
    const { data, error } = await supabase
      .from('events')
      .select('id')
      .eq('is_published', true)
      .limit(50); // Limit to a reasonable number for build time
    
    if (error) {
      console.error('Error fetching events for static paths:', error);
      return [];
    }
    
    // Map the data to the format Next.js expects
    return data.map((event) => ({
      id: event.id.toString(),
    }));
  } catch (error) {
    console.error('Failed to generate static params for events:', error);
    return [];
  }
}
