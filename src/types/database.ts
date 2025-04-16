export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  graduation_year?: number;
  major?: string;
  industry?: string;
  location?: string;
  bio?: string;
  phone_number?: string;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface UserRole {
  id: string;
  profile_id: string;
  role_id: string;
  created_at?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location: string;
  is_virtual: boolean;
  virtual_meeting_link?: string;
  max_attendees?: number;
  creator_id: string;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  profile_id: string;
  status: 'registered' | 'attended' | 'cancelled';
  created_at?: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  description: string;
  requirements?: string;
  salary_range?: string;
  posted_by: string;
  is_active: boolean;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  status: 'pending' | 'reviewed' | 'interviewed' | 'accepted' | 'rejected';
  applied_at: string;
  updated_at?: string;
}

export interface Achievement {
  id: string;
  profile_id: string;
  title: string;
  description?: string;
  year?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MentorshipProgram {
  id: string;
  name: string;
  description: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MentorshipRelationship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  program_id?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface Mentor {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  expertise: string[];
  years_of_experience?: number;
  max_mentees?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MentorAvailability {
  id: string;
  mentor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Mentee {
  id: string;
  user_id: string;
  status: 'pending' | 'active' | 'inactive';
  career_goals?: string;
  preferred_industry?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface MentorshipAppointment {
  id: string;
  availability_id: string;
  mentee_id: string;
  topic: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  feedback_provided: boolean;
  created_at?: string;
  updated_at?: string;
}