# NFE Portal - Cookie Consent Gating Verification

**Test Date:** October 25, 2025  
**Test Environment:** Local + Production  
**Testing Method:** Chrome DevTools Network Tab + Console

---

## Test Objective

Verify that Google Analytics 4 (GA4) events do NOT fire before user consent, and DO fire after consent is given.

---

## Test Procedure

### Pre-Test Setup
1. Open Chrome DevTools (F12)
2. Navigate to **Network** tab
3. Filter network requests by: `analytics` or `google-analytics` or `gtag`
4. Clear browser localStorage: `localStorage.clear()`
5. Hard reload the page (Ctrl+Shift+R)

### Test 1: No Tracking Before Consent

**Steps:**
1. Load page with no consent given
2. Observe cookie consent banner appears
3. Check Network tab for GA4 requests
4. Navigate between pages (click links)
5. Check console for tracking calls

**Expected Result:**
- ❌ NO requests to `google-analytics.com` or `/g/collect`
- ❌ NO gtag() calls in console
- ❌ NO `window.dataLayer` pushes

**Screenshot Location:** `test-results/screenshots/consent-before.png`

---

### Test 2: Tracking After "Accept All"

**Steps:**
1. Continue from Test 1 (no consent state)
2. Click **"Accept All"** button on cookie banner
3. Observe banner disappears
4. Check Network tab immediately
5. Click a CTA button (e.g., "Explore the Science")
6. Check Network tab for new requests

**Expected Result:**
- ✅ Initial consent event fires: `nfe.consent.given`
- ✅ Requests to `google-analytics.com/g/collect` appear
- ✅ Page view event fires: `nfe.page.viewed`
- ✅ CTA click event fires: `nfe.cta.clicked`
- ✅ localStorage shows `nfe-cookie-consent: "accepted"`

**Screenshot Location:** `test-results/screenshots/consent-after.png`

---

### Test 3: Tracking Blocked After "Decline"

**Steps:**
1. Clear localStorage again
2. Hard reload page
3. Click **"Decline"** button on cookie banner
4. Navigate pages and click CTAs
5. Check Network tab

**Expected Result:**
- ❌ NO requests to `google-analytics.com`
- ❌ NO gtag() calls
- ✅ localStorage shows `nfe-cookie-consent: "declined"`
- ✅ Consent denied event may fire once: `nfe.consent.denied`

**Screenshot Location:** `test-results/screenshots/consent-declined.png`

---

## Code Review: Consent Gating Implementation

### `src/lib/analytics.ts`

**Key Functions:**

```typescript
// Analytics configuration with consent flag
const config: AnalyticsConfig = {
  enabled: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
  consent: false, // ← Defaults to FALSE
  measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
};

// Public function to set consent
export function setAnalyticsConsent(consent: boolean) {
  config.consent = consent;
  // ... gtag consent update ...
}

// All tracking functions check consent first
function track(event: NFEEvent, properties?: NFEEventProperties) {
  if (!config.consent) {
    console.log('[Analytics] Consent not given, skipping:', event);
    return; // ← BLOCKS tracking
  }
  // ... track event ...
}
```

**Verification:**
- ✅ `config.consent` defaults to `false`
- ✅ All `track*` functions check `config.consent` before firing
- ✅ `setAnalyticsConsent()` is called only after user clicks "Accept"
- ✅ Debug logging shows when events are blocked

---

### `src/components/shared/CookieConsent.tsx`

**Key Implementation:**

```typescript
const handleAccept = async () => {
  // Set consent in localStorage
  localStorage.setItem('nfe-cookie-consent', 'accepted');
  
  // Enable analytics
  setAnalyticsConsent(true); // ← ENABLES tracking
  trackConsentGiven(); // ← First event
  
  // Hide banner
  setIsVisible(false);
};

const handleDecline = async () => {
  // Set consent in localStorage
  localStorage.setItem('nfe-cookie-consent', 'declined');
  
  // Disable analytics
  setAnalyticsConsent(false); // ← KEEPS tracking disabled
  trackConsentDenied(); // ← May fire if allowed
  
  // Hide banner
  setIsVisible(false);
};
```

**Verification:**
- ✅ `setAnalyticsConsent(true)` called ONLY on accept
- ✅ `setAnalyticsConsent(false)` called on decline
- ✅ Consent state persisted in localStorage
- ✅ Banner reappears if consent not set

---

## Network Capture Evidence

### Before Consent (Screenshot Required)

**What to Capture:**
- Network tab showing NO requests to:
  - `www.google-analytics.com`
  - `/g/collect`
  - `/gtag/js`
- Console showing blocked tracking messages (if debug enabled)
- Cookie consent banner visible on screen

**File:** `test-results/screenshots/consent-before.png`

---

### After Consent - "Accept All" (Screenshot Required)

**What to Capture:**
- Network tab showing requests to:
  - `www.google-analytics.com/g/collect`
  - Event payload visible (e.g., `en=nfe.consent.given`)
- Console showing successful track calls
- localStorage showing `nfe-cookie-consent: "accepted"`
- Cookie banner dismissed

**File:** `test-results/screenshots/consent-after.png`

---

### After Decline (Optional Screenshot)

**What to Capture:**
- Network tab showing NO analytics requests
- localStorage showing `nfe-cookie-consent: "declined"`
- Console showing blocked messages

**File:** `test-results/screenshots/consent-declined.png`

---

## Compliance Check

| Requirement | Status | Evidence |
|-------------|--------|----------|
| No tracking before consent | ⏳ TO VERIFY | Screenshot before consent |
| Tracking after "Accept" | ⏳ TO VERIFY | Screenshot after accept + network log |
| No tracking after "Decline" | ⏳ TO VERIFY | Screenshot after decline |
| Consent persists in localStorage | ✅ VERIFIED | Code review |
| `setAnalyticsConsent()` gates tracking | ✅ VERIFIED | Code review |
| All `track*()` functions check consent | ✅ VERIFIED | Code review |

---

## Manual Test Checklist

- [ ] Clear localStorage and reload page
- [ ] Verify no GA4 requests before consent
- [ ] Take screenshot of network tab (before consent)
- [ ] Click "Accept All" button
- [ ] Verify GA4 requests appear
- [ ] Take screenshot of network tab (after consent)
- [ ] Verify consent event (`nfe.consent.given`) in payload
- [ ] Click a CTA and verify event fires (`nfe.cta.clicked`)
- [ ] Clear localStorage and reload again
- [ ] Click "Decline" button
- [ ] Verify no GA4 requests
- [ ] Take screenshot (after decline)

---

## Conclusion

**Consent Gating Status:** ⏳ PENDING MANUAL VERIFICATION

### Code Implementation
- ✅ Consent gating properly implemented
- ✅ All tracking functions check consent flag
- ✅ Consent state persisted correctly
- ✅ "Decline" option properly blocks tracking

### Manual Testing Required
To complete this verification, please:
1. Run the manual test procedure above
2. Capture the three required screenshots
3. Save screenshots to `test-results/screenshots/`
4. Update this document with ✅ VERIFIED status

---

**Tested by:** Code Review Complete  
**Manual Test:** ⏳ Pending  
**Screenshots:** ⏳ Pending

