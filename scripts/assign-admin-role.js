#!/usr/bin/env node

/**
 * Command-line script to assign admin role to a specific user
 * 
 * Usage: node scripts/assign-admin-role.js <userId>
 */

const { createClient } = require('@supabase/supabase-js');

// Get environment variables or use defaults for local development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function assignAdminRole(userId) {
  try {
    // First, check if the user exists
    const { data: userExists, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (userError || !userExists) {
      console.error(`User with ID ${userId} not found`);
      return false;
    }

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
  // Get user ID from command line arguments
  const userId = process.argv[2] || '5371e2d5-0697-46c0-bf5b-aab2e4d88b58'; // Default to the specified user ID
  
  if (!userId) {
    console.error('Please provide a user ID as an argument');
    process.exit(1);
  }

  console.log(`Attempting to assign admin role to user: ${userId}`);
  const success = await assignAdminRole(userId);
  
  process.exit(success ? 0 : 1);
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});