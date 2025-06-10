// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { nanoid } from 'nanoid';

// Simple in-memory rate limiting store (replace with Redis in production)
interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Rate limit configuration
const RATE_LIMIT_MAX = 100; // Max requests per window
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window

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

// Check rate limit for an IP address
function checkRateLimit(ip: string): { allowed: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  
  // Initialize or reset if window expired
  if (!rateLimitStore[ip] || rateLimitStore[ip].resetTime < now) {
    rateLimitStore[ip] = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }
  
  // Increment counter
  rateLimitStore[ip].count++;
  
  // Check if over limit
  const isAllowed = rateLimitStore[ip].count <= RATE_LIMIT_MAX;
  const remaining = Math.max(0, RATE_LIMIT_MAX - rateLimitStore[ip].count);
  
  return {
    allowed: isAllowed,
    limit: RATE_LIMIT_MAX,
    remaining,
    reset: rateLimitStore[ip].resetTime,
  };
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
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Apply rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip || 'unknown';
    const rateLimit = checkRateLimit(ip);
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimit.reset.toString());
    
    // If rate limit exceeded, return 429 Too Many Requests
    if (!rateLimit.allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.reset.toString(),
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }
  }
  
  // CSRF protection for mutation requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    // Check CSRF token for API routes except authentication endpoints
    if (
      request.nextUrl.pathname.startsWith('/api') && 
      !request.nextUrl.pathname.startsWith('/api/auth')
    ) {
      const csrfToken = request.headers.get('x-csrf-token');
      const csrfCookie = request.cookies.get('csrf-token')?.value;
      
      if (!csrfToken || !csrfCookie || csrfToken !== csrfCookie) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid CSRF token' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  } else if (request.method === 'GET' && !request.nextUrl.pathname.startsWith('/api')) {
    // For GET requests to pages, set a new CSRF token
    const csrfToken = nanoid(32);
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }
  
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
