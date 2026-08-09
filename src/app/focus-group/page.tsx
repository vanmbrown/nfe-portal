import { redirect } from 'next/navigation'

import { FOCUS_GROUP_HOME_ROUTE } from '@/lib/auth/routes'

/**
 * `/focus-group` had no page and answered 404, while the portal masthead on
 * every authenticated screen pointed at it. The one control that looked like
 * "go back to the start" was the one that broke.
 *
 * A redirect rather than a masthead edit, so a bookmark or a typed URL is
 * repaired too. The authenticated layer downstream decides whether a visitor
 * who is not signed in continues to the portal or to sign-in.
 */
export default function FocusGroupIndexPage() {
  redirect(FOCUS_GROUP_HOME_ROUTE)
}
