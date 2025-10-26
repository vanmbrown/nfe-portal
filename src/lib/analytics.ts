/**
 * Analytics utilities for NFE Portal
 * GA4 implementation with privacy-first approach
 */

// Event types for NFE Portal
export type NFEEvent = 
  | 'nfe.page.viewed'
  | 'nfe.cta.clicked'
  | 'nfe.map.interacted'
  | 'nfe.link.clicked'
  | 'nfe.form.submitted'
  | 'nfe.product.viewed'
  | 'nfe.article.read'
  | 'nfe.focus_group.joined'
  | 'nfe.newsletter.subscribed'
  | 'nfe.consent.given'
  | 'nfe.consent.denied'
  | 'nfe.enclave.accessed'
  | 'nfe.file.uploaded';

// Event properties interface
export interface NFEEventProperties {
  page?: string;
  section?: string;
  element?: string;
  value?: string | number;
  category?: string;
  label?: string;
  [key: string]: any;
}

// Analytics configuration
interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  consent: boolean;
  measurementId?: string;
}

// Default configuration
const config: AnalyticsConfig = {
  enabled: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
  consent: false, // Will be set by cookie consent
  measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
};

// GA4 gtag function type
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'consent',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

// Initialize GA4
function initializeGA4(): void {
  if (!config.measurementId || !config.consent) return;

  // Load GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.gtag = window.gtag || function() {
    (window.gtag as any).q = (window.gtag as any).q || [];
    (window.gtag as any).q.push(arguments);
  };

  window.gtag('config', config.measurementId, {
    page_title: document.title,
    page_location: window.location.href,
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
}

// Track event function
export function track(event: NFEEvent, properties?: NFEEventProperties): void {
  if (!config.enabled || !config.consent) {
    if (config.debug) {
      console.log(`[Analytics] Event blocked: ${event}`, properties);
    }
    return;
  }

  if (config.debug) {
    console.log(`[Analytics] Event: ${event}`, properties);
  }

  // Send to GA4
  if (window.gtag && config.measurementId) {
    window.gtag('event', event, {
      event_category: properties?.category || 'engagement',
      event_label: properties?.label,
      value: properties?.value,
      custom_map: {
        page: properties?.page,
        section: properties?.section,
        element: properties?.element,
      },
    });
  }
}

// Page view tracking
export function trackPageView(page: string, title?: string): void {
  track('nfe.page.viewed', {
    page,
    title: title || document.title,
  });
}

// CTA click tracking
export function trackCTAClick(cta: string, location: string): void {
  track('nfe.cta.clicked', {
    element: cta,
    section: location,
  });
}

// Map interaction tracking
export function trackMapInteraction(mapType: string, action: string): void {
  track('nfe.map.interacted', {
    category: mapType,
    label: action,
  });
}

// Form submission tracking
export function trackFormSubmission(formType: string, success: boolean): void {
  track('nfe.form.submitted', {
    category: formType,
    value: success ? 1 : 0,
  });
}

// Product view tracking
export function trackProductView(productId: string, productName: string): void {
  track('nfe.product.viewed', {
    category: 'product',
    label: productName,
    value: productId,
  });
}

// Article read tracking
export function trackArticleRead(articleId: string, articleTitle: string): void {
  track('nfe.article.read', {
    category: 'content',
    label: articleTitle,
    value: articleId,
  });
}

// Newsletter subscription tracking
export function trackNewsletterSubscription(): void {
  track('nfe.newsletter.subscribed', {
    category: 'engagement',
  });
}

// Focus group join tracking
export function trackFocusGroupJoin(): void {
  track('nfe.focus_group.joined', {
    category: 'engagement',
  });
}

// Consent tracking
export function trackConsentGiven(): void {
  track('nfe.consent.given', {
    category: 'privacy',
  });
}

export function trackConsentDenied(): void {
  track('nfe.consent.denied', {
    category: 'privacy',
  });
}

// Initialize analytics (called on app load)
export function initializeAnalytics(): void {
  if (config.debug) {
    console.log('[Analytics] Initialized in debug mode');
  }
  
  if (config.consent && config.measurementId) {
    initializeGA4();
  }
}

// Set consent status
export function setAnalyticsConsent(consent: boolean): void {
  config.consent = consent;
  
  if (config.debug) {
    console.log(`[Analytics] Consent set to: ${consent}`);
  }

  if (consent && config.measurementId) {
    initializeGA4();
    trackConsentGiven();
  } else if (!consent) {
    trackConsentDenied();
  }
}

// Enable/disable analytics
export function setAnalyticsEnabled(enabled: boolean): void {
  config.enabled = enabled;
  if (config.debug) {
    console.log(`[Analytics] Enabled set to: ${enabled}`);
  }
}

// Get current consent status
export function getAnalyticsConsent(): boolean {
  return config.consent;
}

// Check if analytics is ready
export function isAnalyticsReady(): boolean {
  return config.enabled && config.consent && !!config.measurementId;
}

// Legacy functions for backward compatibility
export function trackEvent(eventName: string, parameters?: Record<string, any>) {
  track(eventName as NFEEvent, parameters);
}

// NFE-specific event helpers
export const nfeEvents = {
  enclaveAccessed: (enclaveId: string) => track('nfe.enclave.accessed', { value: enclaveId }),
  fileUploaded: (fileType: string, size: number) => track('nfe.file.uploaded', { category: fileType, value: size }),
  mapInteracted: (mapType: string, interaction: string) => trackMapInteraction(mapType, interaction),
};