// Script to create required storage buckets in Supabase

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env.local file');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBuckets() {
  try {
    console.log('Creating storage buckets...');
    
    // Create bucket for profile images
    const { data: profileBucket, error: profileError } = await supabase.storage.createBucket(
      'profile-images',
      { public: true, fileSizeLimit: 1024 * 1024 * 2 } // 2MB limit
    );
    
    if (profileError && profileError.message !== 'Bucket already exists') {
      throw profileError;
    } else if (profileError) {
      console.log('✓ Profile images bucket already exists');
    } else {
      console.log('✓ Created profile images bucket');
    }
    
    // Create bucket for event images
    const { data: eventBucket, error: eventError } = await supabase.storage.createBucket(
      'event-images',
      { public: true, fileSizeLimit: 1024 * 1024 * 5 } // 5MB limit
    );
    
    if (eventError && eventError.message !== 'Bucket already exists') {
      throw eventError;
    } else if (eventError) {
      console.log('✓ Event images bucket already exists');
    } else {
      console.log('✓ Created event images bucket');
    }
    
    // Create bucket for job attachments
    const { data: jobBucket, error: jobError } = await supabase.storage.createBucket(
      'job-attachments',
      { public: true, fileSizeLimit: 1024 * 1024 * 10 } // 10MB limit
    );
    
    if (jobError && jobError.message !== 'Bucket already exists') {
      throw jobError;
    } else if (jobError) {
      console.log('✓ Job attachments bucket already exists');
    } else {
      console.log('✓ Created job attachments bucket');
    }
    
    console.log('\nAll storage buckets created successfully!');
    console.log('\nStorage buckets available:');
    console.log('- profile-images: For user profile pictures');
    console.log('- event-images: For event cover images and photos');
    console.log('- job-attachments: For job listings attachments');
  } catch (error) {
    console.error('Error creating storage buckets:', error.message);
    process.exit(1);
  }
}

createBuckets();
