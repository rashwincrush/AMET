import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Instead of handling the auth directly in this route,
  // we'll redirect to a client-side page that will handle the auth flow
  const redirectUrl = new URL('/auth/handle-oauth', request.url);
  redirectUrl.searchParams.set('code', code);
  
  return NextResponse.redirect(redirectUrl);
}

// Simple cookie implementation
class Cookie {
  name: string;
  value: string;
  
  constructor(name: string) {
    this.name = name;
    this.value = this.parse();
  }
  
  parse() {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === this.name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return '';
  }
} 