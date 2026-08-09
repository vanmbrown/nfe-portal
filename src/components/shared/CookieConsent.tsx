'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { setAnalyticsConsent, trackConsentGiven, trackConsentDenied } from '@/lib/analytics';
import {
  clearStoredAttribution,
  preserveAttributionFromLocation,
} from '@/lib/analytics/utm';
import {
  COOKIE_CONSENT_DATE_KEY,
  COOKIE_CONSENT_KEY,
  COOKIE_PREFERENCES_CONTROL_ID,
  COOKIE_PREFERENCES_EVENT,
} from './cookie-consent-channel';

interface CookieConsentProps {
  onConsentChange?: (consent: boolean) => void;
}

/**
 * The cookie notice, as a labelled region rather than a dialog.
 *
 * It previously declared `role="dialog"` while behaving as ordinary page
 * content: no `aria-modal`, no focus management, and rendered last in the
 * document, after the footer. That combination announces a modal to assistive
 * technology, then fails every expectation a modal sets.
 *
 * A notice offering a choice is not a modal. It does not trap focus, it does
 * not take focus when it appears, and the page behind it stays fully usable.
 * What it does need is to be reachable in a sensible keyboard order and to
 * leave focus somewhere sensible once a choice is made, which is why it renders
 * before main content and hands focus to the persistent Cookie Preferences
 * control on keyboard dismissal.
 */
export function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const returnFocus = useRef(false);
  const wasVisible = useRef(false);

  useEffect(() => {
    // Absent means undecided, and undecided still needs to be asked.
    if (!localStorage.getItem(COOKIE_CONSENT_KEY)) {
      setIsVisible(true);
    }
  }, []);

  // The footer control reopens the choice at any time.
  useEffect(() => {
    const reopen = () => setIsVisible(true);
    window.addEventListener(COOKIE_PREFERENCES_EVENT, reopen);
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, reopen);
  }, []);

  /**
   * Close, and put focus somewhere deliberate only when the visitor was using
   * the keyboard. A click leaves focus alone; a keyboard activation would
   * otherwise drop focus onto <body> and send the next Tab back to the top of
   * the site. `event.detail === 0` is how a keyboard-activated click reports
   * itself.
   */
  const dismiss = useCallback((viaKeyboard: boolean) => {
    returnFocus.current = viaKeyboard;
    setIsVisible(false);
  }, []);

  // Restore focus after the DOM has actually been updated, not inside the
  // handler. A requestAnimationFrame from the click ran ahead of React's commit
  // often enough to be flaky; an effect keyed on visibility is deterministic.
  useEffect(() => {
    if (!isVisible && wasVisible.current && returnFocus.current) {
      document.getElementById(COOKIE_PREFERENCES_CONTROL_ID)?.focus();
      returnFocus.current = false;
    }
    wasVisible.current = isVisible;
  }, [isVisible]);

  const record = useCallback(
    async (accepted: boolean, viaKeyboard: boolean) => {
      setIsProcessing(true);
      try {
        localStorage.setItem(COOKIE_CONSENT_KEY, accepted ? 'accepted' : 'declined');
        localStorage.setItem(COOKIE_CONSENT_DATE_KEY, new Date().toISOString());

        setAnalyticsConsent(accepted);
        if (accepted) {
          trackConsentGiven();
          // Capture begins here, not on arrival. Whatever brought this visitor
          // to the site is only recorded once they have agreed to it.
          preserveAttributionFromLocation();
        } else {
          trackConsentDenied();
          // Withdrawal is retrospective: anything captured under an earlier
          // acceptance is forgotten rather than merely left unread.
          clearStoredAttribution();
        }

        dismiss(viaKeyboard);
        onConsentChange?.(accepted);
      } catch (error) {
        console.error('Error setting cookie consent:', error);
      } finally {
        setIsProcessing(false);
      }
    },
    [dismiss, onConsentChange]
  );

  if (!isVisible) {
    return null;
  }

  return (
    // A named <section> already exposes the region role, so declaring it would
    // be redundant. The accessible name comes from the heading below.
    <section
      aria-labelledby="cookie-consent-title"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-nfe-gold/30 bg-nfe-ink text-nfe-paper"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-2.5 px-4 py-2.5 md:flex-row md:items-center md:gap-6 md:py-4">
        <div className="flex-1">
          <h2
            id="cookie-consent-title"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-nfe-gold"
          >
            Cookie Consent
          </h2>
          {/* Disclosure text unchanged. Only the layout around it is quieter. */}
          {/* Tighter leading on the narrowest screens keeps the notice a
              modest slice of the viewport without shortening the disclosure. */}
          <p className="mt-1 text-xs leading-[1.35] text-nfe-paper md:mt-1.5 md:text-sm md:leading-6">
            We use cookies to improve your experience and analyze site usage. By clicking
            &quot;Accept All&quot;, you consent to our use of cookies. You can manage your
            preferences at any time. For more information, please read our{' '}
            <a href="/privacy" className="text-nfe-gold underline underline-offset-2 hover:no-underline">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/cookies" className="text-nfe-gold underline underline-offset-2 hover:no-underline">
              Cookie Policy
            </a>
            .
          </p>
        </div>

        <div className="flex flex-row gap-2 md:min-w-fit md:gap-3">
          <Button
            variant="ghost"
            onClick={(event) => record(false, event.detail === 0)}
            disabled={isProcessing}
            className="flex-1 border border-nfe-gold text-nfe-paper hover:bg-nfe-green-700 md:flex-none"
          >
            {isProcessing ? 'Processing...' : 'Decline'}
          </Button>

          <Button
            variant="primary"
            onClick={(event) => record(true, event.detail === 0)}
            disabled={isProcessing}
            className="flex-1 bg-nfe-gold text-nfe-ink hover:bg-nfe-gold-hover md:flex-none"
          >
            {isProcessing ? 'Processing...' : 'Accept All'}
          </Button>
        </div>
      </div>
    </section>
  );
}

// Hook for managing cookie consent state
export function useCookieConsent() {
  const [consent, setConsent] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConsent = () => {
      try {
        const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (storedConsent === 'accepted') {
          setConsent(true);
        } else if (storedConsent === 'declined') {
          setConsent(false);
        } else {
          setConsent(null);
        }
      } catch {
        setConsent(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkConsent();
  }, []);

  return { consent, isLoading };
}
