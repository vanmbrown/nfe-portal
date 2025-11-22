import { getUser } from './session'

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []

export async function isAdmin(): Promise<boolean> {
  const user = await getUser()
  
  if (!user?.email) {
    return false
  }
  
  return ADMIN_EMAILS.includes(user.email.toLowerCase())
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false
  }
  
  // Debug log to help troubleshoot admin access
  const lowerEmail = email.toLowerCase();
  const isMatch = ADMIN_EMAILS.includes(lowerEmail);
  
  if (!isMatch && process.env.NODE_ENV === 'development') {
    console.log(`[Admin Check] Failed for: ${lowerEmail}`);
    console.log(`[Admin Check] Allowed list: ${JSON.stringify(ADMIN_EMAILS)}`);
  }
  
  return isMatch;
}

// Server-side admin check (for use in server components/API routes)
export function checkAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false
  }
  
  return ADMIN_EMAILS.includes(email.toLowerCase())
}








