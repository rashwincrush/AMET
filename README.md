# AMET Alumni Management System

This is the production build of the AMET Alumni Management System. The application has been configured to work directly in production without development server dependencies.

## Production Deployment

### Build and Start

To build and run the application in production mode:

```bash
# Clean any previous builds (optional)
npm run clean

# Build for production
npm run build

# Start the production server
npm run start
```

### Environment Variables

Make sure your `.env.production` file contains all the necessary variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (server-side only)
- `NEXT_PUBLIC_APP_URL` - Your application's public URL

### Deploying to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set up the required environment variables in Vercel's project settings
4. Deploy using Vercel's standard Next.js deployment settings

### Authentication

The application uses Supabase for authentication. Both password-based and OAuth (Google, LinkedIn) authentication methods are supported.

### Making Changes Directly in Production

This build is configured to allow direct changes in the production environment. No local development environment is required.

### Troubleshooting

If you encounter any issues:

1. Check the browser console for errors
2. Verify that all environment variables are set correctly
3. Ensure Supabase authentication is properly configured
4. Look for error messages in the server logs

### Security Considerations

- Always use HTTPS in production
- Keep your Supabase keys secure
- Regularly update dependencies
- Implement proper access controls in your database
