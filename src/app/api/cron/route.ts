import { NextRequest, NextResponse } from 'next/server';
import { processJobAlerts } from '@/lib/services/jobAlertService';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * API handler for cron jobs
 * This endpoint should be called by a cron service (e.g., Vercel Cron)
 * It handles various scheduled tasks like sending job alerts
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get job type from query params
    const { searchParams } = new URL(request.url);
    const jobType = searchParams.get('job');

    // Log cron job execution
    await supabase
      .from('system_logs')
      .insert({
        log_type: 'cron',
        log_message: `Cron job executed: ${jobType || 'all'}`,
        log_data: { job_type: jobType, timestamp: new Date().toISOString() }
      });

    // Process different job types
    const results: Record<string, any> = {};

    // Process daily job alerts
    if (!jobType || jobType === 'daily_alerts') {
      const dailyAlertResults = await processJobAlerts('daily');
      results.daily_alerts = dailyAlertResults;
    }

    // Process weekly job alerts
    if (!jobType || jobType === 'weekly_alerts') {
      const weeklyAlertResults = await processJobAlerts('weekly');
      results.weekly_alerts = weeklyAlertResults;
    }

    // Add other scheduled tasks here as needed
    // For example: database cleanup, report generation, etc.

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    
    // Log error
    await supabase
      .from('system_logs')
      .insert({
        log_type: 'error',
        log_message: `Cron job error: ${error.message}`,
        log_data: { error: error.message, stack: error.stack }
      });
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
