# Supabase Authentication Implementation Guide

This guide provides step-by-step instructions for implementing Supabase authentication in your Alumni Management System, replacing the current mock authentication system.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting Up Supabase Authentication](#setting-up-supabase-authentication)
3. [Implementing Authentication in Your Application](#implementing-authentication-in-your-application)
4. [Role-Based Access Control Integration](#role-based-access-control-integration)
5. [Testing Your Implementation](#testing-your-implementation)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

1. A Supabase project set up (refer to the SUPABASE_SETUP.md guide)
2. The database schema and RBAC structure implemented (refer to the SUPABASE_MIGRATION.sql file)
3. Your Supabase project URL and anon key

## Setting Up Supabase Authentication

### 1. Configure Authentication Settings in Supabase Dashboard

1. Log in to your Supabase dashboard and select your project
2. Navigate to Authentication → Settings
3. Configure the following settings:
   - Site URL: Set to your production URL
   - Redirect URLs: Add both development and production URLs
   - Enable/disable email confirmations based on your requirements
   - Set session timeouts (recommended: 3600 seconds)

### 2. Configure Email Templates

1. Go to Authentication → Email Templates
2. Customize the templates for:
   - Confirmation emails
   - Invitation emails
   - Magic link emails
   - Reset password emails

### 3. Set Up Social Providers (Optional)

1. Go to Authentication → Providers
2. Enable and configure any social providers you want to use (Google, LinkedIn, etc.)
3. Follow provider-specific instructions to set up OAuth credentials

## Implementing Authentication in Your Application

### 1. Install Required Packages

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Set Up Environment Variables

Create or update your `.env.local` file with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create Supabase Client

Replace your current mock implementation with a real Supabase client. Update or create the file at `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 4. Implement Authentication Context

Replace your mock authentication context (`src/lib/mockAuth.tsx`) with a real Supabase authentication implementation. Create or update `src/lib/auth.tsx`:

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  userRole: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user role from the database
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('roles!inner(name)')
        .eq('profile_id', userId)
        .eq('roles.name', 'admin')
        .single();

      if (data) {
        setUserRole('admin');
        return;
      }

      // Check for alumni role
      const { data: alumniData } = await supabase
        .from('user_roles')
        .select('roles!inner(name)')
        .eq('profile_id', userId)
        .eq('roles.name', 'alumni')
        .single();

      if (alumniData) {
        setUserRole('alumni');
        return;
      }

      // Check for employer role
      const { data: employerData } = await supabase
        .from('user_roles')
        .select('roles!inner(name)')
        .eq('profile_id', userId)
        .eq('roles.name', 'employer')
        .single();

      if (employerData) {
        setUserRole('employer');
        return;
      }

      // Default to regular user
      setUserRole('user');
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user'); // Default to regular user on error
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 5. Update Your _app.tsx File

Update your `_app.tsx` file to use the new AuthProvider:

```typescript
import { AuthProvider } from '@/lib/auth';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
```

## Role-Based Access Control Integration

### 1. Create a useRole Hook

Create a custom hook to easily check user roles in your components:

```typescript
// src/lib/useRole.ts
import { useAuth } from './auth';

export function useRole() {
  const { userRole } = useAuth();

  return {
    isAdmin: userRole === 'admin',
    isAlumni: userRole === 'alumni',
    isEmployer: userRole === 'employer',
    isUser: userRole === 'user',
    role: userRole,
  };
}
```

### 2. Create Protected Route Components

Create components to protect routes based on user roles:

```typescript
// src/components/auth/ProtectedRoute.tsx
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : null;
}

// src/components/auth/AdminRoute.tsx
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if (userRole !== 'admin') {
        router.push('/');
      }
    }
  }, [user, isLoading, userRole, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user && userRole === 'admin' ? <>{children}</> : null;
}
```

### 3. Update Your Middleware

Update your middleware to use Supabase authentication for route protection:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Create a Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          // This is used for handling the auth cookie
          const response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set(name, value, options);
          return response;
        },
        remove: (name, options) => {
          const response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.delete(name, options);
          return response;
        },
      },
    }
  );

  // Check auth status
  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes
  const protectedRoutes = ['/profile', '/events/create', '/jobs/post'];
  const adminRoutes = ['/admin'];
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  const isAdminRoute = adminRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Redirect to login if accessing protected route without auth
  if ((isProtectedRoute || isAdminRoute) && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Check for admin role if accessing admin routes
  if (isAdminRoute && session) {
    try {
      // Check if user has admin role
      const { data, error } = await supabase
        .from('user_roles')
        .select('roles!inner(name)')
        .eq('profile_id', session.user.id)
        .eq('roles.name', 'admin')
        .single();

      if (error || !data) {
        // If not admin, redirect to home page
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (err) {
      console.error('Error checking admin role:', err);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|images/).*)',
    '/api/:path*',
  ],
};
```

## Testing Your Implementation

### 1. Test User Registration

1. Navigate to your signup page
2. Register a new user with email and password
3. Verify that a new user is created in Supabase Auth and a corresponding profile is created in the profiles table

### 2. Test User Login

1. Navigate to your login page
2. Log in with the credentials you created
3. Verify that you are redirected to the appropriate page and can access protected routes

### 3. Test Role-Based Access

1. Assign different roles to test users using the Supabase SQL Editor:

```sql
-- Replace with actual user and role IDs
INSERT INTO user_roles (profile_id, role_id)
VALUES ('user-id', 'role-id');
```

2. Test access to admin routes with both admin and non-admin users
3. Verify that role-specific features are only available to users with the appropriate roles

### 4. Test Password Reset

1. Navigate to your password reset page
2. Enter your email address
3. Check your email for the password reset link
4. Follow the link and set a new password
5. Verify that you can log in with the new password

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check that your Supabase URL and anon key are correct
   - Verify that your Supabase project is active
   - Check browser console for specific error messages

2. **Role-Based Access Issues**
   - Verify that roles are correctly assigned in the database
   - Check that the role fetching logic in the AuthProvider is working correctly
   - Use browser developer tools to inspect the auth context state

3. **Middleware Errors**
   - Check server logs for middleware execution errors
   - Verify that the middleware matcher is correctly configured
   - Test with simplified middleware to isolate issues

### Debugging Tips

1. Add console logs to track authentication state changes
2. Use the Supabase dashboard to monitor authentication events
3. Check the Network tab in browser developer tools to inspect API calls
4. Verify database tables and relationships using the Supabase Table Editor

## Conclusion

You have now successfully implemented Supabase authentication with role-based access control in your Alumni Management System. This implementation provides:

- Secure user authentication
- Role-based access control
- Protected routes based on authentication status and user roles
- Password reset functionality

Remember to regularly update your Supabase dependencies and monitor for security updates.