import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { hasPermission } from '@/lib/roles';

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

// Get all backups
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Check admin access
    const { hasAccess, error, status, user } = await checkAdminAccess(supabase);
    
    if (!hasAccess) {
      return NextResponse.json({ error }, { status });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Get backups with pagination
    const { data: backups, count, error: backupsError } = await supabase
      .from('backups')
      .select('*, profiles!created_by(first_name, last_name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (backupsError) {
      return NextResponse.json({ error: backupsError.message }, { status: 500 });
    }
    
    return NextResponse.json({ backups, count, page, limit });
  } catch (error: any) {
    console.error('Error getting backups:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new backup
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Check admin access
    const { hasAccess, error, status, user } = await checkAdminAccess(supabase);
    
    if (!hasAccess) {
      return NextResponse.json({ error }, { status });
    }
    
    const { tables, notes } = await request.json();
    
    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      return NextResponse.json({ error: 'No tables selected for backup' }, { status: 400 });
    }
    
    // Start a backup job
    const backupId = crypto.randomUUID();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    
    // Create a backup record
    const { error: insertError } = await supabase
      .from('backups')
      .insert({
        id: backupId,
        created_by: user.id,
        filename,
        tables,
        record_counts: {},
        status: 'processing',
        notes
      });
    
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    
    // In a real implementation, we would start a background job to create the backup
    // For this demo, we'll simulate the process with a timeout
    
    // Simulate backup process (in a real app, this would be a background job)
    setTimeout(async () => {
      try {
        // Get record counts for each table
        const recordCounts: Record<string, number> = {};
        
        for (const table of tables) {
          const { count, error: countError } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (!countError) {
            recordCounts[table] = count || 0;
          }
        }
        
        // Generate a simple SQL dump (in a real app, this would be more comprehensive)
        let sqlDump = `-- Backup generated on ${new Date().toISOString()}\n`;
        sqlDump += `-- Tables: ${tables.join(', ')}\n\n`;
        
        // In a real implementation, we would generate proper SQL dump here
        // For this demo, we'll just create a placeholder
        
        // Upload the backup file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('backups')
          .upload(`${backupId}/${filename}`, new Blob([sqlDump], { type: 'text/plain' }));
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Update the backup record with success status
        await supabase
          .from('backups')
          .update({
            status: 'completed',
            file_size: sqlDump.length,
            record_counts: recordCounts
          })
          .eq('id', backupId);
      } catch (error: any) {
        console.error('Error creating backup:', error);
        
        // Update the backup record with error status
        await supabase
          .from('backups')
          .update({
            status: 'failed',
            validation_results: { error: error.message }
          })
          .eq('id', backupId);
      }
    }, 2000);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Backup initiated', 
      backupId 
    });
  } catch (error: any) {
    console.error('Error creating backup:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
