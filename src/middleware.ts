// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// List of public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/home',
  '/about',
  '/auth/login',
  '/auth/signup',
  '/jobs'
];

// Check if the route is public
function isPublicRoute(path: string) {
  return PUBLIC_ROUTES.some(route => path.startsWith(route)) ||
    path.startsWith('/_next') ||
    path.startsWith('/api/public') ||
    path.includes('favicon.ico') ||
    path.includes('.png') ||
    path.includes('.jpg') ||
    path.includes('.svg');
}

// Handle authentication, security headers, and routing
export async function middleware(request: NextRequest) {
  // Handle root and index route redirection
  // This is the primary way we handle these routes to avoid static generation issues
  if (request.nextUrl.pathname === '/' || 
      request.nextUrl.pathname === '/index' ||
      request.nextUrl.pathname === '/index.html') {
    return NextResponse.redirect(new URL('/home', request.url));
  }
  
  // Create a response object
  let response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  
  try {
    // Create a Supabase client for handling auth in middleware
    const supabase = createMiddlewareClient({ req: request, res: response });
    
    // Refresh the session - this is important to keep the session alive
    // and ensure auth state is current
    await supabase.auth.getSession();
    
    // Only check authentication for non-public routes
    if (!isPublicRoute(request.nextUrl.pathname)) {
      // Get the session after refreshing
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session and trying to access protected route, redirect to login
      if (!session) {
        const redirectUrl = new URL('/auth/login', request.url);
        // Add the original URL as a query parameter for redirecting back after login
        redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }
  } catch (e) {
    console.error('Middleware auth error:', e);
    // In case of auth error on protected routes, redirect to login
    if (!isPublicRoute(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  
  return response;
}

// Configure which paths this middleware should be applied to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes - handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
