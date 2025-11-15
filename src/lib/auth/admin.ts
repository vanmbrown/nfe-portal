import { getUser } from './session'

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []

export async function isAdmin(): Promise<boolean> {
  const user = await getUser()
  
  if (!user?.email) {
    return false
  }
  
  return ADMIN_EMAILS.includes(user.email)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false
  }
  
  return ADMIN_EMAILS.includes(email)
}

// Server-side admin check (for use in server components/API routes)
export function checkAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false
  }
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
  return adminEmails.includes(email)
}








