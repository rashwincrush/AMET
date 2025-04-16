import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { hasPermission } from '@/lib/roles';

// Force dynamic to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// Helper function to check if user has admin access
async function checkAdminAccess(supabase: any) {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { hasAccess: false, error: 'Unauthorized', status: 401, user: null };
  }
  
  // Get user roles
  const { data: userRolesData, error: rolesError } = await supabase
    .from('user_roles')
    .select('roles!inner(name)')
    .eq('profile_id', user.id);
  
  if (rolesError) {
    return { hasAccess: false, error: 'Failed to verify permissions', status: 500, user };
  }
  
  const userRoles = userRolesData?.map((role: { roles: { name: string } }) => role.roles.name) || [];
  
  // Check if user has admin or super_admin role
  if (!hasPermission(userRoles, 'manage_settings')) {
    return { hasAccess: false, error: 'Insufficient permissions', status: 403, user };
  }
  
  return { hasAccess: true, user };
}

// Run validation checks on database
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Check admin access
    const { hasAccess, error, status } = await checkAdminAccess(supabase);
    
    if (!hasAccess) {
      return NextResponse.json({ error }, { status });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const tables = url.searchParams.get('tables');
    
    // Parse tables parameter
    const tablesToValidate = tables ? tables.split(',') : ['profiles', 'events', 'jobs', 'achievements'];
    
    // Run validation checks
    const validationResults: Record<string, any> = {};
    
    // Validate profiles table
    if (tablesToValidate.includes('profiles')) {
      const profileResults = await validateProfiles(supabase);
      validationResults.profiles = profileResults;
    }
    
    // Validate events table
    if (tablesToValidate.includes('events')) {
      const eventResults = await validateEvents(supabase);
      validationResults.events = eventResults;
    }
    
    // Validate jobs table
    if (tablesToValidate.includes('jobs')) {
      const jobResults = await validateJobs(supabase);
      validationResults.jobs = jobResults;
    }
    
    // Validate achievements table
    if (tablesToValidate.includes('achievements')) {
      const achievementResults = await validateAchievements(supabase);
      validationResults.achievements = achievementResults;
    }
    
    return NextResponse.json({ validationResults });
  } catch (error: any) {
    console.error('Error validating data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Validate profiles table
async function validateProfiles(supabase: any) {
  const results = {
    totalRecords: 0,
    validRecords: 0,
    invalidRecords: 0,
    errors: [] as any[]
  };
  
  try {
    // Get all profiles
    const { data: profiles, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' });
    
    if (error) throw error;
    
    results.totalRecords = count || 0;
    
    // Validate each profile
    for (const profile of profiles) {
      const errors = [];
      
      // Check required fields
      if (!profile.first_name) errors.push('Missing first name');
      if (!profile.last_name) errors.push('Missing last name');
      
      // Validate email format
      if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
        errors.push('Invalid email format');
      }
      
      // Check graduation year format if present
      if (profile.graduation_year && !/^\d{4}$/.test(profile.graduation_year.toString())) {
        errors.push('Invalid graduation year format');
      }
      
      // Add to results if errors found
      if (errors.length > 0) {
        results.invalidRecords++;
        results.errors.push({
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name}`,
          errors
        });
      } else {
        results.validRecords++;
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error validating profiles:', error);
    return { error: 'Failed to validate profiles', details: error };
  }
}

// Validate events table
async function validateEvents(supabase: any) {
  const results = {
    totalRecords: 0,
    validRecords: 0,
    invalidRecords: 0,
    errors: [] as any[]
  };
  
  try {
    // Get all events
    const { data: events, error, count } = await supabase
      .from('events')
      .select('*', { count: 'exact' });
    
    if (error) throw error;
    
    results.totalRecords = count || 0;
    
    // Validate each event
    for (const event of events) {
      const errors = [];
      
      // Check required fields
      if (!event.title) errors.push('Missing title');
      if (!event.description) errors.push('Missing description');
      if (!event.start_date) errors.push('Missing start date');
      if (!event.end_date) errors.push('Missing end date');
      
      // Validate date integrity
      if (event.start_date && event.end_date && new Date(event.start_date) > new Date(event.end_date)) {
        errors.push('Start date is after end date');
      }
      
      // Validate capacity if present
      if (event.capacity !== null && event.capacity !== undefined && event.capacity <= 0) {
        errors.push('Capacity must be a positive number');
      }
      
      // Add to results if errors found
      if (errors.length > 0) {
        results.invalidRecords++;
        results.errors.push({
          id: event.id,
          title: event.title,
          errors
        });
      } else {
        results.validRecords++;
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error validating events:', error);
    return { error: 'Failed to validate events', details: error };
  }
}

// Validate jobs table
async function validateJobs(supabase: any) {
  const results = {
    totalRecords: 0,
    validRecords: 0,
    invalidRecords: 0,
    errors: [] as any[]
  };
  
  try {
    // Get all jobs
    const { data: jobs, error, count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact' });
    
    if (error) throw error;
    
    results.totalRecords = count || 0;
    
    // Validate each job
    for (const job of jobs) {
      const errors = [];
      
      // Check required fields
      if (!job.title) errors.push('Missing title');
      if (!job.company_name) errors.push('Missing company name');
      if (!job.description) errors.push('Missing description');
      
      // Validate expiry date if present
      if (job.expires_at && new Date(job.expires_at) < new Date()) {
        errors.push('Job has expired');
      }
      
      // Validate URL format if present
      if (job.application_url && !/^https?:\/\//.test(job.application_url)) {
        errors.push('Invalid application URL format');
      }
      
      // Validate email format if present
      if (job.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(job.contact_email)) {
        errors.push('Invalid contact email format');
      }
      
      // Add to results if errors found
      if (errors.length > 0) {
        results.invalidRecords++;
        results.errors.push({
          id: job.id,
          title: job.title,
          errors
        });
      } else {
        results.validRecords++;
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error validating jobs:', error);
    return { error: 'Failed to validate jobs', details: error };
  }
}

// Validate achievements table
async function validateAchievements(supabase: any) {
  const results = {
    totalRecords: 0,
    validRecords: 0,
    invalidRecords: 0,
    errors: [] as any[]
  };
  
  try {
    // Get all achievements
    const { data: achievements, error, count } = await supabase
      .from('achievements')
      .select('*', { count: 'exact' });
    
    if (error) throw error;
    
    results.totalRecords = count || 0;
    
    // Validate each achievement
    for (const achievement of achievements) {
      const errors = [];
      
      // Check required fields
      if (!achievement.title) errors.push('Missing title');
      if (!achievement.category) errors.push('Missing category');
      
      // Validate URL format if present
      if (achievement.url && !/^https?:\/\//.test(achievement.url)) {
        errors.push('Invalid URL format');
      }
      
      // Add to results if errors found
      if (errors.length > 0) {
        results.invalidRecords++;
        results.errors.push({
          id: achievement.id,
          title: achievement.title,
          errors
        });
      } else {
        results.validRecords++;
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error validating achievements:', error);
    return { error: 'Failed to validate achievements', details: error };
  }
}
