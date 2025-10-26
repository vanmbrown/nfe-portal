'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { setAnalyticsConsent, trackConsentGiven, trackConsentDenied } from '@/lib/analytics';

interface CookieConsentProps {
  onConsentChange?: (consent: boolean) => void;
}

export function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem('nfe-cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = async () => {
    setIsProcessing(true);
    
    try {
      // Set consent in localStorage
      localStorage.setItem('nfe-cookie-consent', 'accepted');
      localStorage.setItem('nfe-cookie-consent-date', new Date().toISOString());
      
      // Enable analytics
      setAnalyticsConsent(true);
      trackConsentGiven();
      
      // Hide banner
      setIsVisible(false);
      
      // Notify parent component
      onConsentChange?.(true);
    } catch (error) {
      console.error('Error setting cookie consent:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    
    try {
      // Set consent in localStorage
      localStorage.setItem('nfe-cookie-consent', 'declined');
      localStorage.setItem('nfe-cookie-consent-date', new Date().toISOString());
      
      // Disable analytics
      setAnalyticsConsent(false);
      trackConsentDenied();
      
      // Hide banner
      setIsVisible(false);
      
      // Notify parent component
      onConsentChange?.(false);
    } catch (error) {
      console.error('Error setting cookie consent:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-nfe-ink text-nfe-paper p-4 shadow-lg"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 id="cookie-consent-title" className="font-semibold text-lg mb-2">
              Cookie Consent
            </h3>
            <p id="cookie-consent-description" className="text-sm text-nfe-paper mb-4 md:mb-0">
              We use cookies to improve your experience and analyze site usage. 
              By clicking &quot;Accept All&quot;, you consent to our use of cookies. 
              You can manage your preferences at any time.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
            <Button
              variant="ghost"
              onClick={handleDecline}
              disabled={isProcessing}
              className="text-nfe-paper hover:bg-nfe-green-700 border border-nfe-gold"
            >
              {isProcessing ? 'Processing...' : 'Decline'}
            </Button>
            
            <Button
              variant="primary"
              onClick={handleAccept}
              disabled={isProcessing}
              className="bg-nfe-gold text-nfe-ink hover:bg-nfe-gold-600"
            >
              {isProcessing ? 'Processing...' : 'Accept All'}
            </Button>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-600">
          <p className="text-xs text-nfe-paper">
            For more information, please read our{' '}
            <a 
              href="/privacy" 
              className="text-nfe-gold underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
            {' '}and{' '}
            <a 
              href="/cookies" 
              className="text-nfe-gold underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cookie Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

// Hook for managing cookie consent state
export function useCookieConsent() {
  const [consent, setConsent] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConsent = () => {
      try {
        const storedConsent = localStorage.getItem('nfe-cookie-consent');
        if (storedConsent === 'accepted') {
          setConsent(true);
        } else if (storedConsent === 'declined') {
          setConsent(false);
        } else {
          setConsent(null);
        }
      } catch (error) {
        console.error('Error reading cookie consent:', error);
        setConsent(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkConsent();
  }, []);

  const updateConsent = (newConsent: boolean) => {
    setConsent(newConsent);
    setAnalyticsConsent(newConsent);
  };

  return {
    consent,
    isLoading,
    updateConsent,
    hasConsent: consent === true,
    hasDeclined: consent === false,
    needsConsent: consent === null,
  };
}
