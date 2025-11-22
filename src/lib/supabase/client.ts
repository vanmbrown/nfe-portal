import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables with helpful error messages
if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
  throw new Error(
    'Missing or invalid NEXT_PUBLIC_SUPABASE_URL. Please:\n' +
    '1. Create a Supabase project at https://supabase.com\n' +
    '2. Get your Project URL from Settings → API\n' +
    '3. Update .env.local with your actual Supabase URL'
  )
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key') {
  throw new Error(
    'Missing or invalid NEXT_PUBLIC_SUPABASE_ANON_KEY. Please:\n' +
    '1. Get your anon public key from Supabase Settings → API\n' +
    '2. Update .env.local with your actual Supabase anon key'
  )
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch {
  throw new Error(
    `Invalid Supabase URL format: "${supabaseUrl}".\n` +
    'URL must be a valid HTTP or HTTPS URL (e.g., https://xxxxx.supabase.co)'
  )
}

// Singleton client instance to prevent multiple GoTrueClient instances
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

export const createClientSupabase = () => {
  // Return existing client if available (client-side only)
  if (typeof window !== 'undefined' && supabaseClient) {
    return supabaseClient;
  }

  // Create new client with proper storage configuration
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'nfe-portal-supabase-auth', // Shared storage key to prevent multiple instances
    },
  });

  // Cache client for client-side
  if (typeof window !== 'undefined') {
    supabaseClient = client;
  }

  return client;
}

