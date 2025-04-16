import { NextRequest, NextResponse } from 'next/server';
import { mentorshipService } from '@/lib/services/mentorshipService';
import { supabase } from '@/lib/supabase';

// GET - Retrieve mentorship appointments
export async function GET(request: NextRequest) {
  try {
    // Check authorization from the session cookie
    const authorizationHeader = request.headers.get('authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorizationHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'mentor' or 'mentee'
    const statusParam = searchParams.get('status'); // 'pending', 'confirmed', 'completed', 'cancelled'

    if (type === 'mentor') {
      // Check if user is a mentor
      const { data: mentorData, error: mentorError } = await supabase
        .from('mentors')
        .select('id')
        .eq('user_id', profileData.id)
        .single();

      if (mentorError || !mentorData) {
        return NextResponse.json({ error: 'User is not a mentor' }, { status: 403 });
      }

      const appointments = await mentorshipService.getMentorAppointments(mentorData.id, statusParam || undefined);
      return NextResponse.json(appointments);
    } else if (type === 'mentee') {
      const appointments = await mentorshipService.getMenteeAppointments(profileData.id, statusParam || undefined);
      return NextResponse.json(appointments);
    } else {
      // Check if user is an admin
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('profile_id', profileData.id);

      if (rolesError || !userRoles) {
        return NextResponse.json({ error: 'Error checking user roles' }, { status: 500 });
      }

      const isAdmin = userRoles.some(role => role.role_id === '1'); // Assuming role_id 1 is admin

      if (!isAdmin) {
        return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
      }

      // Admin can view all appointments
      const mentorId = searchParams.get('mentorId');
      const menteeId = searchParams.get('menteeId');

      // Admins can filter by specific mentor or mentee if needed
      if (mentorId) {
        const appointments = await mentorshipService.getMentorAppointments(mentorId, statusParam || undefined);
        return NextResponse.json(appointments);
      } else if (menteeId) {
        const appointments = await mentorshipService.getMenteeAppointments(menteeId, statusParam || undefined);
        return NextResponse.json(appointments);
      } else {
        // Get all appointments for admins (potentially with pagination in the future)
        const { data: allAppointments } = await supabase
          .from('mentorship_appointments')
          .select('*, mentor_availability(*), profiles(*)');

        return NextResponse.json(allAppointments);
      }
    }
  } catch (error) {
    console.error('Error retrieving appointments:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve appointments' },
      { status: 500 }
    );
  }
}

// POST - Book a new appointment
export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authorizationHeader = request.headers.get('authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorizationHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { availability_id, topic, message } = body;

    // Validate required fields
    if (!availability_id || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields: availability_id and topic are required' },
        { status: 400 }
      );
    }

    // Get user profile (mentee)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check if the availability slot exists and is not booked
    const { data: availabilityData, error: availabilityError } = await supabase
      .from('mentor_availability')
      .select('*')
      .eq('id', availability_id)
      .eq('is_booked', false)
      .single();

    if (availabilityError || !availabilityData) {
      return NextResponse.json(
        { error: 'Availability slot not found or already booked' },
        { status: 400 }
      );
    }

    // Prevent booking your own availability slot
    const { data: mentorData, error: mentorError } = await supabase
      .from('mentors')
      .select('user_id')
      .eq('id', availabilityData.mentor_id)
      .single();

    if (mentorError) {
      return NextResponse.json({ error: 'Error checking mentor data' }, { status: 500 });
    }

    if (mentorData?.user_id === profileData.id) {
      return NextResponse.json(
        { error: 'You cannot book your own availability slot' },
        { status: 400 }
      );
    }

    // Book the appointment
    const appointmentData = {
      availability_id,
      mentee_id: profileData.id,
      topic,
      message: message || null,
      status: 'pending' as const
    };

    const newAppointment = await mentorshipService.bookAppointment(appointmentData);

    // Mark the availability slot as booked
    await supabase
      .from('mentor_availability')
      .update({ is_booked: true })
      .eq('id', availability_id);

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error('Error booking appointment:', error);
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    );
  }
}

// PATCH - Update appointment status (confirm, cancel, complete)
export async function PATCH(request: NextRequest) {
  try {
    // Check authorization
    const authorizationHeader = request.headers.get('authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorizationHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { appointment_id, status, feedback } = body;

    if (!appointment_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: appointment_id and status are required' },
        { status: 400 }
      );
    }

    // Validate status values
    const validStatuses = ['confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value. Must be one of: confirmed, cancelled, completed' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    // Get the appointment to check permissions
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('mentorship_appointments')
      .select('*, mentor_availability(mentor_id)')
      .eq('id', appointment_id)
      .single();

    if (appointmentError || !appointmentData) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Check if user is a mentor
    const { data: mentorData, error: mentorError } = await supabase
      .from('mentors')
      .select('id, user_id')
      .eq('user_id', profileData.id)
      .single();

    // Check if user is an admin
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('profile_id', profileData.id);

    if (rolesError) {
      return NextResponse.json({ error: 'Error checking user roles' }, { status: 500 });
    }

    const isAdmin = userRoles && userRoles.some(role => role.role_id === '1');
    const isMentee = appointmentData.mentee_id === profileData.id;
    const isMentor = mentorData && mentorData.id === appointmentData.mentor_availability.mentor_id;

    // Permission check
    if (!isAdmin && !isMentee && !isMentor) {
      return NextResponse.json(
        { error: 'You do not have permission to update this appointment' },
        { status: 403 }
      );
    }

    // Only mentors and admins can confirm appointments
    if (status === 'confirmed' && !isMentor && !isAdmin) {
      return NextResponse.json(
        { error: 'Only mentors can confirm appointments' },
        { status: 403 }
      );
    }

    // Update the appointment status
    await mentorshipService.updateAppointmentStatus(appointment_id, status);

    // If providing feedback (completed appointments)
    if (status === 'completed' && feedback) {
      await mentorshipService.addAppointmentFeedback(appointment_id, feedback);
    }

    // If canceled, free up the availability slot
    if (status === 'cancelled') {
      await supabase
        .from('mentor_availability')
        .update({ is_booked: false })
        .eq('id', appointmentData.availability_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
} 