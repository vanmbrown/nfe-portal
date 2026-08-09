'use client';

import { COOKIE_PREFERENCES_EVENT, COOKIE_PREFERENCES_CONTROL_ID } from './cookie-consent-channel';

/**
 * A persistent way back to the cookie choice.
 *
 * Once the notice is dismissed it does not return, so without this a visitor
 * had no way to revisit or withdraw consent short of clearing storage. It also
 * gives keyboard focus somewhere sensible to land after a choice is made, which
 * is what stops dismissal from dropping focus onto the body and restarting the
 * next Tab at the top of the site.
 *
 * Deliberately quiet: it sits with the other legal utilities and reads as
 * housekeeping, not as an invitation.
 */
export function CookiePreferencesButton({ className = '' }: { className?: string }) {
  return (
    <button
      id={COOKIE_PREFERENCES_CONTROL_ID}
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(COOKIE_PREFERENCES_EVENT))}
      className={`underline underline-offset-4 transition-colors hover:text-nfe-gold ${className}`}
    >
      Cookie Preferences
    </button>
  );
}
