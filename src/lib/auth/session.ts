import { createClientSupabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export async function getSession() {
  const supabase = createClientSupabase()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  
  return session
}

export async function getUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user ?? null
}

export async function signOut() {
  const supabase = createClientSupabase()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}








