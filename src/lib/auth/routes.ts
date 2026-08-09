/** Where the participant portal's sign-in and landing actually live.
 *
 *  Three separate call sites had drifted to a bare `/login`, a route that does
 *  not exist and answers 404 — including one that was the entire body of the
 *  enclave landing page. Declared once so they cannot drift apart again.
 */
export const FOCUS_GROUP_LOGIN_ROUTE = '/focus-group/login'

/** Where an authenticated participant lands. The auth callback already uses
 *  this path, so the portal masthead now agrees with it. */
export const FOCUS_GROUP_HOME_ROUTE = '/focus-group/profile'
