// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// This middleware handles authentication and cookies
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
    // Create a Supabase client specifically for handling auth in middleware
    const supabase = createMiddlewareClient({ req, res });
    
    // Optional: refresh session if expired
    await supabase.auth.getSession();
  } catch (e) {
    console.error('Middleware error:', e);
  }
  
  return res;
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
