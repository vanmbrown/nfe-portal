// TODO: Implement Supabase Auth strategy in Week 3
export interface User {
  id: string
  email: string
  enclaveId?: string
}

export interface AuthState {
  user: User | null
  loading: boolean
}

// Placeholder for auth context and hooks
export function useAuth(): AuthState {
  // TODO: Implement Supabase auth hooks
  return { user: null, loading: false }
}


