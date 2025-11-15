import { NextRequest, NextResponse } from 'next/server';
import { createClientSupabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle errors from Supabase auth (e.g., expired email links)
  if (error) {
    const errorMessage = errorDescription 
      ? decodeURIComponent(errorDescription)
      : 'Authentication error occurred';
    
    // Redirect to login page with error message
    const loginUrl = new URL('/focus-group/login', requestUrl.origin);
    loginUrl.searchParams.set('error', error);
    loginUrl.searchParams.set('message', errorMessage);
    
    return NextResponse.redirect(loginUrl);
  }

  // Handle successful OAuth/code exchange
  if (code) {
    const supabase = createClientSupabase();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      const loginUrl = new URL('/focus-group/login', requestUrl.origin);
      loginUrl.searchParams.set('error', 'auth_failed');
      loginUrl.searchParams.set('message', exchangeError.message);
      return NextResponse.redirect(loginUrl);
    }

    // Success - redirect to appropriate page
    return NextResponse.redirect(new URL('/focus-group/profile', requestUrl.origin));
  }

  // No code or error - redirect to login
  return NextResponse.redirect(new URL('/focus-group/login', requestUrl.origin));
}








