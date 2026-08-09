import { redirect } from 'next/navigation'

import { FOCUS_GROUP_LOGIN_ROUTE } from '@/lib/auth/routes'

export default function EnclaveIndexPage() {
  // This previously redirected to a bare sign-in path that does not exist, so
  // the whole of the enclave landing was an unconditional trip to a 404.
  redirect(FOCUS_GROUP_LOGIN_ROUTE)
}
