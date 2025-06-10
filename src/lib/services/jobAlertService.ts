import { createClient } from '@supabase/supabase-js';
import { sendJobAlert } from './emailService';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Job alert matching system
 * Matches job postings with user alerts and sends notifications
 */

interface JobAlert {
  id: string;
  user_id: string;
  alert_name: string;
  job_titles?: string[];
  industries?: string[];
  locations?: string[];
  job_types?: string[];
  min_salary?: number;
  keywords?: string[];
  frequency: 'daily' | 'weekly' | 'immediate';
  enabled: boolean;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  job_type?: string;
  industry?: string;
  salary_range?: string;
  description?: string;
  requirements?: string;
  created_at: string;
}

interface JobMatch {
  job: Job;
  alert: JobAlert;
  score: number;
  matchedOn: string[];
}

/**
 * Calculate match score between a job and an alert
 * @param job Job posting
 * @param alert User alert
 * @returns Match score and matching criteria
 */
function calculateMatchScore(job: Job, alert: JobAlert): { score: number; matchedOn: string[] } {
  let score = 0;
  const matchedOn: string[] = [];
  
  // Match job title
  if (alert.job_titles && alert.job_titles.length > 0) {
    const titleMatches = alert.job_titles.some(title => 
      job.title.toLowerCase().includes(title.toLowerCase())
    );
    if (titleMatches) {
      score += 30;
      matchedOn.push('job title');
    }
  }
  
  // Match industry
  if (alert.industries && alert.industries.length > 0 && job.industry) {
    const industryMatches = alert.industries.some(industry => 
      job.industry?.toLowerCase().includes(industry.toLowerCase())
    );
    if (industryMatches) {
      score += 20;
      matchedOn.push('industry');
    }
  }
  
  // Match location
  if (alert.locations && alert.locations.length > 0 && job.location) {
    const locationMatches = alert.locations.some(location => 
      job.location?.toLowerCase().includes(location.toLowerCase())
    );
    if (locationMatches) {
      score += 20;
      matchedOn.push('location');
    }
  }
  
  // Match job type
  if (alert.job_types && alert.job_types.length > 0 && job.job_type) {
    const jobTypeMatches = alert.job_types.some(type => 
      job.job_type?.toLowerCase() === type.toLowerCase()
    );
    if (jobTypeMatches) {
      score += 15;
      matchedOn.push('job type');
    }
  }
  
  // Match salary
  if (alert.min_salary && job.salary_range) {
    // Extract numeric value from salary range
    const salaryMatch = job.salary_range.match(/\d+/g);
    if (salaryMatch) {
      const jobSalary = parseInt(salaryMatch[0]);
      if (jobSalary >= alert.min_salary) {
        score += 15;
        matchedOn.push('salary');
      }
    }
  }
  
  // Match keywords in description or requirements
  if (alert.keywords && alert.keywords.length > 0) {
    const jobText = `${job.description || ''} ${job.requirements || ''}`.toLowerCase();
    const keywordMatches = alert.keywords.filter(keyword => 
      jobText.includes(keyword.toLowerCase())
    );
    
    if (keywordMatches.length > 0) {
      score += keywordMatches.length * 5;
      matchedOn.push('keywords');
    }
  }
  
  return { score, matchedOn };
}

/**
 * Process job alerts for a specific frequency
 * @param frequency Alert frequency to process ('daily', 'weekly', 'immediate')
 * @returns Processing results
 */
export async function processJobAlerts(frequency: 'daily' | 'weekly' | 'immediate') {
  try {
    // Get all enabled alerts for the specified frequency
    const { data: alerts, error: alertsError } = await supabase
      .from('job_alerts')
      .select('*')
      .eq('enabled', true)
      .eq('frequency', frequency);
    
    if (alertsError) throw alertsError;
    if (!alerts || alerts.length === 0) {
      return { success: true, processed: 0, message: 'No alerts to process' };
    }
    
    // Get recent jobs (last 24 hours for daily, last 7 days for weekly, all for immediate)
    let sinceDate = new Date();
    if (frequency === 'daily') {
      sinceDate.setDate(sinceDate.getDate() - 1);
    } else if (frequency === 'weekly') {
      sinceDate.setDate(sinceDate.getDate() - 7);
    } else {
      // For immediate, get jobs from the last hour
      sinceDate.setHours(sinceDate.getHours() - 1);
    }
    
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .gte('created_at', sinceDate.toISOString())
      .eq('is_approved', true);
    
    if (jobsError) throw jobsError;
    if (!jobs || jobs.length === 0) {
      return { success: true, processed: 0, message: 'No recent jobs to match' };
    }
    
    // Process each alert
    let matchesSent = 0;
    const matchResults: JobMatch[] = [];
    
    for (const alert of alerts) {
      // Get user email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', alert.user_id)
        .single();
      
      if (userError || !user?.email) {
        console.error(`Could not find email for user ${alert.user_id}`);
        continue;
      }
      
      // Find matching jobs for this alert
      const alertMatches = jobs.map(job => {
        const { score, matchedOn } = calculateMatchScore(job, alert);
        return { job, alert, score, matchedOn };
      }).filter(match => match.score >= 30); // Only consider good matches (score >= 30)
      
      // Sort matches by score (highest first)
      alertMatches.sort((a, b) => b.score - a.score);
      
      // Send notifications for top matches
      for (const match of alertMatches) {
        // Check if we've already sent this job to this user
        const { data: existingNotification, error: notificationError } = await supabase
          .from('job_alert_notifications')
          .select('id')
          .eq('user_id', alert.user_id)
          .eq('job_id', match.job.id)
          .single();
        
        if (!notificationError && existingNotification) {
          // Already sent this notification
          continue;
        }
        
        // Generate job URL
        const jobUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/jobs/${match.job.id}`;
        
        // Send email notification
        const emailResult = await sendJobAlert(
          user.email,
          match.job.title,
          match.job.company,
          jobUrl
        );
        
        if (emailResult.success) {
          // Log the notification in the database
          await supabase
            .from('job_alert_notifications')
            .insert({
              user_id: alert.user_id,
              job_id: match.job.id,
              alert_id: alert.id,
              match_score: match.score,
              matched_criteria: match.matchedOn,
              sent_at: new Date().toISOString()
            });
          
          matchesSent++;
          matchResults.push(match);
        }
      }
    }
    
    return {
      success: true,
      processed: alerts.length,
      matched: matchResults.length,
      sent: matchesSent,
      matches: matchResults
    };
  } catch (error) {
    console.error('Error processing job alerts:', error);
    return { success: false, error };
  }
}

/**
 * Process immediate job alerts
 * This function should be called whenever a new job is posted
 * @param jobId ID of the newly posted job
 * @returns Processing results
 */
export async function processImmediateJobAlerts(jobId: string) {
  try {
    // Get the job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    
    if (jobError || !job) {
      throw new Error(`Job not found: ${jobId}`);
    }
    
    // Get all enabled immediate alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('job_alerts')
      .select('*')
      .eq('enabled', true)
      .eq('frequency', 'immediate');
    
    if (alertsError) throw alertsError;
    if (!alerts || alerts.length === 0) {
      return { success: true, processed: 0, message: 'No immediate alerts to process' };
    }
    
    // Process each alert
    let matchesSent = 0;
    const matchResults: JobMatch[] = [];
    
    for (const alert of alerts) {
      // Calculate match score
      const { score, matchedOn } = calculateMatchScore(job, alert);
      
      // Only consider good matches (score >= 30)
      if (score >= 30) {
        // Get user email
        const { data: user, error: userError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', alert.user_id)
          .single();
        
        if (userError || !user?.email) {
          console.error(`Could not find email for user ${alert.user_id}`);
          continue;
        }
        
        // Generate job URL
        const jobUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/jobs/${job.id}`;
        
        // Send email notification
        const emailResult = await sendJobAlert(
          user.email,
          job.title,
          job.company,
          jobUrl
        );
        
        if (emailResult.success) {
          // Log the notification in the database
          await supabase
            .from('job_alert_notifications')
            .insert({
              user_id: alert.user_id,
              job_id: job.id,
              alert_id: alert.id,
              match_score: score,
              matched_criteria: matchedOn,
              sent_at: new Date().toISOString()
            });
          
          matchesSent++;
          matchResults.push({ job, alert, score, matchedOn });
        }
      }
    }
    
    return {
      success: true,
      processed: alerts.length,
      matched: matchResults.length,
      sent: matchesSent,
      matches: matchResults
    };
  } catch (error) {
    console.error('Error processing immediate job alerts:', error);
    return { success: false, error };
  }
}
