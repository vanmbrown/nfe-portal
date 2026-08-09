/** How the footer's Cookie Preferences control reopens the notice.
 *
 *  A custom event rather than shared state: the two live in different parts of
 *  the tree and nothing else needs to know about the connection. */
export const COOKIE_PREFERENCES_EVENT = 'nfe:cookie-preferences'

/** The stable destination focus returns to after a choice is made. */
export const COOKIE_PREFERENCES_CONTROL_ID = 'cookie-preferences'

/** Where the decision is recorded. */
export const COOKIE_CONSENT_KEY = 'nfe-cookie-consent'
export const COOKIE_CONSENT_DATE_KEY = 'nfe-cookie-consent-date'
