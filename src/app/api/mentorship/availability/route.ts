import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createServerClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

// Force dynamic to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// GET - Retrieve mentor availability slots
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const mentorId = url.searchParams.get('mentor_id');
    const date = url.searchParams.get('date');
    const isBooked = url.searchParams.get('is_booked');
    
    if (!mentorId) {
      return NextResponse.json(
        { error: 'mentor_id parameter is required' },
        { status: 400 }
      );
    }
    
    // Build query
    let query = supabase
      .from('mentor_availability')
      .select('*')
      .eq('mentor_id', mentorId);
    
    // Add optional filters
    if (date) {
      query = query.eq('date', date);
    }
    
    if (isBooked !== null) {
      query = query.eq('is_booked', isBooked === 'true');
    }
    
    // Execute query
    const { data, error } = await query.order('date').order('start_time');
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ slots: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Add new availability slots
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const cookieStore = cookies();
    const supabaseServer = createServerClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const requestData = await request.json();
    const { mentor_id, date, start_time, end_time } = requestData;
    
    // Validate required fields
    if (!mentor_id || !date || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user is the mentor
    const { data: mentorData, error: mentorError } = await supabase
      .from('mentors')
      .select('id')
      .eq('id', mentor_id)
      .eq('user_id', user.id)
      .single();
    
    if (mentorError || !mentorData) {
      return NextResponse.json(
        { error: 'You can only add availability for yourself' },
        { status: 403 }
      );
    }
    
    // Create availability slot
    const { data: availabilityData, error: availabilityError } = await supabase
      .from('mentor_availability')
      .insert({
        mentor_id,
        date,
        start_time,
        end_time,
        is_booked: false
      })
      .select()
      .single();
    
    if (availabilityError) {
      return NextResponse.json(
        { error: availabilityError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Availability slot added successfully', slot: availabilityData },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove availability slots
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const cookieStore = cookies();
    const supabaseServer = createServerClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get slot ID from URL
    const url = new URL(request.url);
    const slotId = url.searchParams.get('id');
    
    if (!slotId) {
      return NextResponse.json(
        { error: 'id parameter is required' },
        { status: 400 }
      );
    }
    
    // Get the slot to check ownership
    const { data: slotData, error: slotError } = await supabase
      .from('mentor_availability')
      .select('mentor_id')
      .eq('id', slotId)
      .single();
    
    if (slotError) {
      return NextResponse.json(
        { error: 'Availability slot not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the mentor
    const { data: mentorData, error: mentorError } = await supabase
      .from('mentors')
      .select('id')
      .eq('id', slotData.mentor_id)
      .eq('user_id', user.id)
      .single();
    
    if (mentorError || !mentorData) {
      return NextResponse.json(
        { error: 'You can only delete your own availability slots' },
        { status: 403 }
      );
    }
    
    // Delete the slot
    const { error: deleteError } = await supabase
      .from('mentor_availability')
      .delete()
      .eq('id', slotId);
    
    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Availability slot deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}