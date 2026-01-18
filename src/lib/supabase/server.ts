import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

// Support both NEXT_PUBLIC_ prefixed and non-prefixed environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Server-side client for authenticated requests (uses Authorization header or cookies)
export const createServerSupabase = async (request?: NextRequest) => {
  let accessToken: string | null = null
  
  // Try to get access token from Authorization header first
  if (request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7)
    }
  }
  
  // If no token in header, try cookies
  if (!accessToken) {
    const cookieStore = await cookies()
    
    // Extract project ref from URL for cookie name pattern
    const urlMatch = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)
    const projectRef = urlMatch ? urlMatch[1] : ''
    const authTokenCookie = cookieStore.get(`sb-${projectRef}-auth-token`)
    
    if (authTokenCookie) {
      try {
        // Parse the cookie value (it's JSON with access_token and refresh_token)
        const tokenData = JSON.parse(authTokenCookie.value)
        accessToken = tokenData.access_token || null
      } catch {
        // Cookie might not be JSON, try as direct token
        accessToken = authTokenCookie.value
      }
    }
  }
  
  // Create client
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
    },
  })
  
  // If we have an access token, verify it by getting the user
  if (accessToken) {
    // The token will be used automatically in subsequent requests
    // via the Authorization header we set above
  }
  
  return client
}

// Admin client with service role (use sparingly, only for admin operations)
export const createAdminSupabase = () => {
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for admin operations')
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

