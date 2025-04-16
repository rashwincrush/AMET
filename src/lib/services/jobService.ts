import { supabase } from '@/lib/supabase';
import { JobListing, JobApplication } from '@/types/database';

export const jobService = {
  // Get all job listings
  async getAllJobs() {
    const { data, error } = await supabase
      .from('job_listings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as JobListing[];
  },
  
  // Get active job listings
  async getActiveJobs(limit = 10) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('job_listings')
      .select('*')
      .eq('is_published', true)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as JobListing[];
  },
  
  // Get job by ID
  async getJobById(id: string) {
    const { data, error } = await supabase
      .from('job_listings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as JobListing;
  },
  
  // Create a new job listing
  async createJob(job: Omit<JobListing, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('job_listings')
      .insert([job])
      .select()
      .single();
    
    if (error) throw error;
    return data as JobListing;
  },
  
  // Update a job listing
  async updateJob(id: string, updates: Partial<JobListing>) {
    const { data, error } = await supabase
      .from('job_listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as JobListing;
  },
  
  // Delete a job listing
  async deleteJob(id: string) {
    const { error } = await supabase
      .from('job_listings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
  
  // Apply for a job
  async applyForJob(jobId: string, applicantId: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .insert([
        {
          job_id: jobId,
          applicant_id: applicantId,
          status: 'pending',
          applied_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data as JobApplication;
  },
  
  // Get job applications for a job
  async getJobApplications(jobId: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        profiles:applicant_id (id, first_name, last_name, email, avatar_url)
      `)
      .eq('job_id', jobId);
    
    if (error) throw error;
    return data;
  },
  
  // Update application status
  async updateApplicationStatus(applicationId: string, status: 'pending' | 'reviewed' | 'interviewed' | 'accepted' | 'rejected') {
    const { data, error } = await supabase
      .from('job_applications')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();
    
    if (error) throw error;
    return data as JobApplication;
  }
}; 