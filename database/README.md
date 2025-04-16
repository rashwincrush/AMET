# Database Fixes for Alumni Management System

This directory contains migrations and scripts to fix database schema issues in the Alumni Management System.

## Issues Fixed

1. Missing columns in the `profiles` table:
   - `is_mentor`
   - `mentor_availability`
   - `mentor_topics`

2. Missing tables:
   - `jobs` - For job listings
   - `activity_logs` - For tracking user activities
   - `mentors` - For storing mentor information
   - `mentor_availability` - For storing mentor availability time slots
   - `mentees` - For storing mentee information
   - `mentorship_appointments` - For tracking booked mentorship appointments

3. Missing storage buckets:
   - `profile-images` - For user profile pictures
   - `event-images` - For event cover images
   - `job-attachments` - For job listings attachments

## How to Apply Fixes

### 1. Run Database Migrations

To apply the database schema changes, run the following command from the project root:

```bash
psql -h <your-supabase-db-host> -p 5432 -d postgres -U postgres -f database/migrations/fix_missing_tables.sql
```

For the mentorship availability tables, run:

```bash
psql -h <your-supabase-db-host> -p 5432 -d postgres -U postgres -f database/migrations/add_mentor_availability_table.sql
```

Alternatively, you can copy and paste the SQL from the migration files into the Supabase SQL Editor in the dashboard.

### 2. Create Storage Buckets

To create the required storage buckets, run:

```bash
npm install # If you haven't already installed dependencies
node scripts/create-storage-buckets.js
```

This script will create the necessary storage buckets in your Supabase project.

## Verification

After applying these fixes, you should be able to:

1. Become a mentor (the "Become a Mentor" button should now work)
2. Create and manage jobs
3. Upload event images
4. See activity logs in the admin dashboard
5. Manage mentor availability and book mentorship appointments

## Troubleshooting

If you encounter any issues:

1. Check that your `.env.local` file contains the correct Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. Ensure you have the necessary permissions to create tables and buckets in your Supabase project.

3. If you're still having issues, check the Supabase dashboard for any error messages or logs.

## Recent Updates (Mentor Availability System)

The latest migration (`add_mentor_availability_table.sql`) adds support for the mentor availability scheduling system with these key features:

1. Mentors can define their available time slots
2. Mentees can book appointments with mentors
3. Both parties can manage and track their mentorship appointments
4. Proper row-level security ensures data access control

This enables the complete mentorship booking workflow in the application.
