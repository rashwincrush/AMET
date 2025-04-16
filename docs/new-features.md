# New Features Documentation

## Table of Contents
1. [Two-Factor Authentication](#two-factor-authentication)
2. [CSV Import/Export](#csv-importexport)
3. [Database Migrations](#database-migrations)

## Two-Factor Authentication

### Overview
Two-Factor Authentication (2FA) adds an extra layer of security to user accounts by requiring a verification code sent to the user's email during login, in addition to their password.

### Features
- Email-based verification codes
- "Remember this device" option for trusted devices
- Account recovery via backup email
- Security settings page for enabling/disabling 2FA

### Setup Instructions

1. **Apply Database Migrations**
   ```bash
   # Run the SQL migration to add necessary tables and columns
   psql -h <your-supabase-db-host> -p 5432 -d postgres -U postgres -f database/migrations/feature_updates.sql
   ```
   
   Or copy and paste the SQL from `database/migrations/feature_updates.sql` into the Supabase SQL Editor.

2. **Access Security Settings**
   - Navigate to `/settings/security` in the application
   - Enable 2FA and set a recovery email

### User Flow

1. **Enabling 2FA**:
   - User navigates to Security Settings
   - Toggles 2FA on
   - Enters a recovery email (different from primary email)
   - Confirms settings

2. **Login with 2FA**:
   - User enters email and password
   - If credentials are valid and 2FA is enabled, user is prompted for a verification code
   - Code is sent to user's primary email
   - User enters the code to complete login
   - Optionally selects "Remember this device" to skip 2FA for 30 days on that device

3. **Account Recovery**:
   - User clicks "Recover account" on the login page
   - Enters their email address
   - Recovery code is sent to the backup email
   - User enters the recovery code to disable 2FA and regain access

## CSV Import/Export

### Overview
The CSV Import/Export feature allows administrators to bulk import and export data for users, events, and jobs using CSV files.

### Features
- CSV and Excel export formats
- Customizable data filters for exports
- Field mapping for imports
- Validation and error reporting
- Batch processing for large imports

### Setup Instructions

1. **Install Required Dependencies**
   ```bash
   npm install papaparse xlsx react-dropzone
   ```

2. **Access Import/Export Page**
   - Navigate to `/admin/import-export` in the application
   - This page is only accessible to users with admin or super_admin roles

### User Flow

1. **Importing Data**:
   - Select the entity type (users, events, or jobs)
   - Download the template CSV file
   - Fill in the template with your data
   - Upload the CSV file
   - Map CSV columns to database fields
   - Validate the data and review any errors
   - Complete the import

2. **Exporting Data**:
   - Select the entity type
   - Choose export format (CSV or Excel)
   - Apply filters if needed (e.g., graduation year, role, etc.)
   - Download the exported file

### CSV Templates
Pre-defined templates are available for all entity types:

- **Users**: `/templates/users_template.csv`
- **Events**: `/templates/events_template.csv`
- **Jobs**: `/templates/jobs_template.csv`

## Database Migrations

The following database changes are required for these features:

### Two-Factor Authentication
- New columns in `profiles` table:
  - `two_factor_enabled` (boolean)
  - `recovery_email` (text)
  - `trusted_devices` (jsonb)
- New `recovery_codes` table for storing temporary recovery codes

### CSV Import/Export
- New activity log types for tracking import and export operations

### Applying Migrations

Run the combined migration script:

```bash
psql -h <your-supabase-db-host> -p 5432 -d postgres -U postgres -f database/migrations/feature_updates.sql
```

Or use the Supabase SQL Editor to run the contents of `database/migrations/feature_updates.sql`.

## Troubleshooting

### Two-Factor Authentication
- If users can't receive verification codes, check email delivery settings
- If recovery emails aren't working, verify the recovery_codes table exists
- For testing in development, codes are logged to the console

### CSV Import/Export
- If imports fail, check CSV formatting (UTF-8 encoding, proper headers)
- For large imports, monitor server memory usage
- If field mapping is incorrect, download and use the provided templates
