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

// Get a specific backup
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Check admin access
    const { hasAccess, error, status } = await checkAdminAccess(supabase);
    
    if (!hasAccess) {
      return NextResponse.json({ error }, { status });
    }
    
    const backupId = params.id;
    
    // Get backup details
    const { data: backup, error: backupError } = await supabase
      .from('backups')
      .select('*, profiles!created_by(first_name, last_name)')
      .eq('id', backupId)
      .single();
    
    if (backupError) {
      return NextResponse.json({ error: backupError.message }, { status: 404 });
    }
    
    // Get download URL if backup is completed
    let downloadUrl = null;
    if (backup.status === 'completed') {
      const { data: urlData } = await supabase.storage
        .from('backups')
        .createSignedUrl(`${backupId}/${backup.filename}`, 60); // 60 seconds expiry
      
      if (urlData) {
        downloadUrl = urlData.signedUrl;
      }
    }
    
    return NextResponse.json({ backup, downloadUrl });
  } catch (error: any) {
    console.error('Error getting backup:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete a backup
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Check admin access
    const { hasAccess, error, status } = await checkAdminAccess(supabase);
    
    if (!hasAccess) {
      return NextResponse.json({ error }, { status });
    }
    
    const backupId = params.id;
    
    // Delete the backup file from storage
    const { data: backup, error: backupError } = await supabase
      .from('backups')
      .select('filename')
      .eq('id', backupId)
      .single();
    
    if (backupError) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }
    
    // Delete the file from storage
    await supabase.storage
      .from('backups')
      .remove([`${backupId}/${backup.filename}`]);
    
    // Delete the backup record
    const { error: deleteError } = await supabase
      .from('backups')
      .delete()
      .eq('id', backupId);
    
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting backup:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Restore from a backup
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Check admin access
    const { hasAccess, error, status, user } = await checkAdminAccess(supabase);
    
    if (!hasAccess) {
      return NextResponse.json({ error }, { status });
    }
    
    const backupId = params.id;
    const { tables } = await request.json();
    
    // Validate tables array
    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      return NextResponse.json({ error: 'No tables selected for restore' }, { status: 400 });
    }
    
    // Get backup details
    const { data: backup, error: backupError } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backupId)
      .single();
    
    if (backupError || !backup) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }
    
    // Check if backup is completed
    if (backup.status !== 'completed') {
      return NextResponse.json({ error: 'Backup is not ready for restore' }, { status: 400 });
    }
    
    // In a real implementation, we would start a background job to restore the backup
    // For this demo, we'll simulate the process with a timeout
    
    // Create a restore record
    const restoreId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    const { error: insertError } = await supabase
      .from('backups')
      .insert({
        id: restoreId,
        created_by: user.id,
        filename: `restore-from-${backup.filename}`,
        tables,
        record_counts: {},
        status: 'restoring',
        notes: `Restore from backup ${backupId} created on ${backup.created_at}`
      });
    
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    
    // Simulate restore process (in a real app, this would be a background job)
    setTimeout(async () => {
      try {
        // In a real implementation, we would restore the data here
        // For this demo, we'll just update the status
        
        // Update the restore record with success status
        await supabase
          .from('backups')
          .update({
            status: 'restored',
            record_counts: backup.record_counts
          })
          .eq('id', restoreId);
      } catch (error: any) {
        console.error('Error restoring backup:', error);
        
        // Update the restore record with error status
        await supabase
          .from('backups')
          .update({
            status: 'failed',
            validation_results: { error: error.message }
          })
          .eq('id', restoreId);
      }
    }, 3000);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Restore initiated', 
      restoreId 
    });
  } catch (error: any) {
    console.error('Error restoring backup:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
