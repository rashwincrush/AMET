import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware ensures proper routing for the root and /index paths
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle the problematic /index route by redirecting to /home
  if (pathname === '/index') {
    return NextResponse.redirect(new URL('/home', request.url));
  }
  
  // If the pathname is exactly the root path '/', also redirect to /home
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }
  
  // For all other routes, continue with normal processing
  return NextResponse.next();
}

// Configure the matcher to only run middleware on specific paths
export const config = {
  matcher: ['/', '/index'],
}
