import { Page } from '@playwright/test';

/**
 * Dismisses the cookie consent banner if it's visible.
 * This should be called at the start of tests that might be blocked by the cookie consent dialog.
 */
export async function dismissCookieConsent(page: Page): Promise<void> {
  try {
    // Check if cookie consent is visible
    const cookieConsent = page.locator('[role="dialog"][aria-labelledby="cookie-consent-title"]');
    
    if (await cookieConsent.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Try to click "Accept All" button
      const acceptButton = page.getByRole('button', { name: /accept all/i });
      if (await acceptButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await acceptButton.click();
        // Wait for the dialog to disappear
        await cookieConsent.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
      }
    }
  } catch (error) {
    // If cookie consent is not visible or already dismissed, that's fine
    // We can ignore errors here
  }
}

/**
 * Sets cookie consent in localStorage to prevent the banner from showing.
 * This is useful for tests that need to avoid the cookie consent dialog entirely.
 */
export async function setCookieConsentInStorage(page: Page, accepted: boolean = true): Promise<void> {
  await page.addInitScript((accepted) => {
    localStorage.setItem('nfe-cookie-consent', accepted ? 'accepted' : 'declined');
    localStorage.setItem('nfe-cookie-consent-date', new Date().toISOString());
  }, accepted);
}

