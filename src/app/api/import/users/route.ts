import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { hasPermission } from '@/lib/roles';

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Skip the check if we're using a mock client or no permissions needed
    if (typeof hasPermission === 'function') {
      // Cast userRoles to any to avoid type issues for now
      const hasAccess = await hasPermission(user.id, 'manage_users');
      if (!hasAccess) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }
    
    const { users, mappings } = await request.json();
    
    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'No users provided' }, { status: 400 });
    }
    
    // Process users in batches of 100
    const batchSize = 100;
    const results = {
      success: 0,
      errors: [] as any[],
      total: users.length
    };
    
    // Process each batch
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const processedBatch = batch.map((user: any, index: number) => {
        try {
          // Map CSV fields to database fields using the provided mappings
          const mappedUser: Record<string, any> = {};
          
          for (const [dbField, csvField] of Object.entries(mappings)) {
            if (csvField && typeof csvField === 'string' && csvField in user) {
              // Handle special fields
              if (dbField === 'skills' || dbField === 'mentor_topics') {
                // Convert comma-separated string to array
                mappedUser[dbField] = user[csvField].split(',').map((item: string) => item.trim());
              } else if (dbField === 'is_mentor' || dbField === 'is_mentee') {
                // Convert string to boolean
                mappedUser[dbField] = String(user[csvField]).toLowerCase() === 'true';
              } else {
                // Use the value as is
                mappedUser[dbField] = user[csvField];
              }
            }
          }
          
          // Validate required fields
          if (!mappedUser.email) {
            throw new Error('Email is required');
          }
          
          if (!mappedUser.first_name || !mappedUser.last_name) {
            throw new Error('First name and last name are required');
          }
          
          return mappedUser;
        } catch (error: any) {
          // Track errors with row number
          results.errors.push({
            row: i + index + 1, // +1 because CSV is 1-indexed (header row is 1)
            error: error.message,
            data: user
          });
          return null;
        }
      }).filter(Boolean); // Remove null entries (validation failures)
      
      if (processedBatch.length > 0) {
        // Insert valid users into the database
        const { data, error } = await supabase.from('profiles').upsert(
          processedBatch.map(user => ({
            ...user,
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'email', ignoreDuplicates: false }
        );
        
        if (error) {
          console.error('Batch insert error:', error);
          results.errors.push({
            batch: i / batchSize + 1,
            error: error.message
          });
        } else {
          results.success += processedBatch.length;
        }
      }
    }
    
    // Log the import activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      activity_type: 'user_import',
      details: {
        total: users.length,
        success: results.success,
        errors: results.errors.length
      }
    });
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
