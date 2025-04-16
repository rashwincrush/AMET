// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Create a response object to manipulate cookies
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name) {
          response.cookies.delete(name);
        },
      },
    }
  );

  // Check auth status
  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes
  const protectedRoutes = ['/profile', '/events/create', '/jobs/post', '/dashboard'];
  const adminRoutes = ['/admin'];
  const publicRoutes = ['/', '/about', '/directory', '/events', '/jobs', '/mentorship'];
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  const isAdminRoute = adminRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route)
  );

  // Allow access to public routes without authentication
  if (isPublicRoute) {
    return response;
  }

  // Only redirect to login if accessing protected or admin routes without auth
  if ((isProtectedRoute || isAdminRoute) && !session) {
    // Check for any auth tokens in cookies before redirecting
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const supabaseToken = request.cookies.get('supabase.auth.token')?.value;
    
    // If we have any tokens, let the client-side handle the auth check
    if (refreshToken || accessToken || supabaseToken) {
      console.log('Found auth tokens in cookies, allowing access to protected route');
      
      // Try to refresh the session server-side if we have a refresh token
      if (refreshToken) {
        try {
          // Attempt to refresh the session but don't block the request
          supabase.auth.refreshSession();
        } catch (error) {
          console.error('Error refreshing session in middleware:', error);
          // Continue even if refresh fails - client-side will handle it
        }
      }
      
      return response;
    }
    
    // Save the current URL as a query parameter for redirection after login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
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

  // CSRF protection for POST/PUT/DELETE/PATCH requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    try {
      const csrfToken = request.headers.get('x-csrf-token');
      const storedCsrfToken = request.cookies.get('csrf-token')?.value;
      
      // Validate CSRF token using constant-time comparison to prevent timing attacks
      if (!csrfToken || !storedCsrfToken) {
        return new NextResponse(
          JSON.stringify({ error: 'Missing CSRF token' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Use crypto.timingSafeEqual for constant-time comparison when available
      // For simplicity in this example, we're using string comparison
      if (csrfToken !== storedCsrfToken) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid CSRF token' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error('Error validating CSRF token:', error);
      return new NextResponse(
        JSON.stringify({ error: 'CSRF validation error' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|images/).*)',
    '/api/:path*',
  ],
};
