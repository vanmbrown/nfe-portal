'use client';

import { useEffect } from 'react';

/**
 * SkipLinkHandler - Ensures #main-content receives focus when skip link is activated
 * 
 * This component handles the focus behavior for skip links by:
 * 1. Listening for hash changes (when skip link is clicked)
 * 2. Focusing the #main-content element when hash matches
 * 3. Scrolling the element into view
 */
export default function SkipLinkHandler() {
  useEffect(() => {
    const handleHashChange = () => {
      // Check if hash matches main-content
      if (window.location.hash === '#main-content') {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          // Small delay to ensure navigation is complete
          setTimeout(() => {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    };

    // Handle initial hash if present
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Also listen for click events on skip links
    const handleSkipLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href') === '#main-content') {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Update URL without triggering navigation
          window.history.pushState(null, '', '#main-content');
        }
      }
    };

    document.addEventListener('click', handleSkipLinkClick);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('click', handleSkipLinkClick);
    };
  }, []);

  return null; // This component doesn't render anything
}

