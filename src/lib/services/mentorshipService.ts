import { supabase } from '@/lib/supabase';

export interface MentorshipProgram {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive' | 'upcoming';
  created_at: string;
  updated_at: string;
}

export interface MentorshipRelationship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  program_id: string;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  field: string;
  goals: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface MentorAvailability {
  id: string;
  mentor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at: string;
}

export interface MentorshipAppointment {
  id: string;
  availability_id: string;
  mentee_id: string;
  topic: string;
  message: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  feedback: string | null;
  feedback_provided: boolean;
  created_at: string;
  updated_at: string;
}

// Mentorship service functions
export const mentorshipService = {
  // Program management
  getAllPrograms: async () => {
    const { data, error } = await supabase
      .from('mentorship_programs')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data as MentorshipProgram[];
  },

  // Mentorship relationship management
  getMentorshipRelationships: async (
    mentorId?: string,
    menteeId?: string,
    status?: string,
    programId?: string
  ) => {
    let query = supabase.from('mentorship_relationships').select(`
      *,
      mentor:mentor_id(id, user_id, profiles:user_id(first_name, last_name, avatar_url, email, graduation_year, industry)),
      mentee:mentee_id(first_name, last_name, avatar_url, email, graduation_year, industry),
      program:program_id(title, description)
    `);

    if (mentorId) query = query.eq('mentor_id', mentorId);
    if (menteeId) query = query.eq('mentee_id', menteeId);
    if (status) query = query.eq('status', status);
    if (programId) query = query.eq('program_id', programId);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data as any[];
  },

  createMentorshipRequest: async (request: Omit<MentorshipRelationship, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('mentorship_relationships')
      .insert(request)
      .select();

    if (error) throw error;
    return data[0] as MentorshipRelationship;
  },

  updateMentorshipStatus: async (id: string, status: MentorshipRelationship['status']) => {
    const updates: any = { status };
    
    if (status === 'active') {
      updates.start_date = new Date().toISOString();
    } else if (status === 'completed') {
      updates.end_date = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('mentorship_relationships')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0] as MentorshipRelationship;
  },

  // Mentor availability management
  addMentorAvailability: async (availabilityData: Omit<MentorAvailability, 'id' | 'created_at' | 'is_booked'>) => {
    const data = {
      ...availabilityData,
      is_booked: false
    };

    const { data: result, error } = await supabase
      .from('mentor_availability')
      .insert(data)
      .select();

    if (error) throw error;
    return result[0] as MentorAvailability;
  },

  getMentorAvailability: async (mentorId: string, date?: string) => {
    let query = supabase
      .from('mentor_availability')
      .select('*')
      .eq('mentor_id', mentorId);

    if (date) {
      query = query.eq('date', date);
    }

    query = query.order('start_time', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return data as MentorAvailability[];
  },

  deleteMentorAvailability: async (availabilityId: string) => {
    const { error } = await supabase
      .from('mentor_availability')
      .delete()
      .eq('id', availabilityId);

    if (error) throw error;
    return true;
  },

  // Appointment management
  getMentorAppointments: async (mentorId: string, status?: string) => {
    let query = supabase
      .from('mentorship_appointments')
      .select(`
        *,
        mentor_availability(id, mentor_id, date, start_time, end_time),
        mentee:mentee_id(id, first_name, last_name, avatar_url, email, graduation_year, bio)
      `)
      .eq('mentor_availability.mentor_id', mentorId);

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('mentor_availability.date', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return data as any[];
  },

  getMenteeAppointments: async (menteeId: string, status?: string) => {
    let query = supabase
      .from('mentorship_appointments')
      .select(`
        *,
        mentor_availability(id, mentor_id, date, start_time, end_time, 
          mentor:mentor_id(id, profiles:user_id(id, first_name, last_name, avatar_url, email)))
      `)
      .eq('mentee_id', menteeId);

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('mentor_availability.date', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return data as any[];
  },

  bookAppointment: async (appointmentData: Omit<MentorshipAppointment, 'id' | 'created_at' | 'updated_at' | 'feedback' | 'feedback_provided'>) => {
    // Set default values for feedback fields
    const data = {
      ...appointmentData,
      feedback: null,
      feedback_provided: false
    };

    const { data: result, error } = await supabase
      .from('mentorship_appointments')
      .insert(data)
      .select();

    if (error) throw error;
    return result[0] as MentorshipAppointment;
  },

  updateAppointmentStatus: async (appointmentId: string, status: MentorshipAppointment['status']) => {
    const { data, error } = await supabase
      .from('mentorship_appointments')
      .update({ status })
      .eq('id', appointmentId)
      .select();

    if (error) throw error;
    return data[0] as MentorshipAppointment;
  },

  addAppointmentFeedback: async (appointmentId: string, feedback: string) => {
    const { data, error } = await supabase
      .from('mentorship_appointments')
      .update({ 
        feedback, 
        feedback_provided: true 
      })
      .eq('id', appointmentId)
      .select();

    if (error) throw error;
    return data[0] as MentorshipAppointment;
  }
}; 