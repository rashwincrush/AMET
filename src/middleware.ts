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

// Add security headers and handle root page redirect
export async function middleware(request: NextRequest) {
  // Handle root route redirection to avoid static generation issues
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }
  
  let response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  
  // Only check authentication for non-public routes
  if (!isPublicRoute(request.nextUrl.pathname)) {
    try {
      // Create a Supabase client for handling auth in middleware
      const supabase = createMiddlewareClient({ req: request, res: response });
      
      // Check the session
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session and trying to access protected route, redirect to login
      if (!session && !isPublicRoute(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    } catch (e) {
      console.error('Middleware auth error:', e);
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
