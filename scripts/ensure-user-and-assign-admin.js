#!/usr/bin/env node

/**
 * Command-line script to ensure a user exists and assign admin role
 * 
 * Usage: node scripts/ensure-user-and-assign-admin.js <userId> [email]
 */

const { createClient } = require('@supabase/supabase-js');

// Get environment variables or use defaults for local development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// The user ID to make admin
const TARGET_USER_ID = '5371e2d5-0697-46c0-bf5b-aab2e4d88b58';

async function ensureUserExists(userId, email = 'admin@example.com') {
  try {
    // Check if user exists in profiles table
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (existingUser) {
      console.log(`User ${userId} already exists in profiles table`);
      return true;
    }
    
    // User doesn't exist, create the profile
    console.log(`Creating user profile for ${userId}`);
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error(`Error creating user profile: ${insertError.message}`);
      return false;
    }
    
    console.log(`Successfully created user profile for ${userId}`);
    return true;
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    return false;
  }
}

async function assignAdminRole(userId) {
  try {
    // Get the admin role ID
    const { data: adminRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single();
    
    if (roleError || !adminRole) {
      console.error('Admin role not found in the database');
      return false;
    }

    // Check if the user already has the admin role
    const { data: existingRole, error: existingRoleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('profile_id', userId)
      .eq('role_id', adminRole.id)
      .single();
    
    if (existingRole) {
      console.log(`User ${userId} already has admin role`);
      return true;
    }

    // Assign the admin role to the user
    const { error: assignError } = await supabase
      .from('user_roles')
      .insert({
        profile_id: userId,
        role_id: adminRole.id
      });
    
    if (assignError) {
      console.error(`Error assigning admin role: ${assignError.message}`);
      return false;
    }

    console.log(`Admin role successfully assigned to user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error in assignAdminRole:', error);
    return false;
  }
}

// Main execution
async function main() {
  // Get user ID from command line arguments or use default
  const userId = process.argv[2] || TARGET_USER_ID;
  const email = process.argv[3] || 'admin@example.com';
  
  console.log(`Ensuring user exists and assigning admin role to: ${userId}`);
  
  // First ensure the user exists
  const userExists = await ensureUserExists(userId, email);
  if (!userExists) {
    console.error('Failed to ensure user exists');
    process.exit(1);
  }
  
  // Then assign admin role
  const roleAssigned = await assignAdminRole(userId);
  if (!roleAssigned) {
    console.error('Failed to assign admin role');
    process.exit(1);
  }
  
  console.log('✅ Successfully ensured user exists and assigned admin role');
  process.exit(0);
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});