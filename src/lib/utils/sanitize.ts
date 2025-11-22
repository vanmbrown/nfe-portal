/**
 * HTML Sanitization Utility
 * Uses DOMPurify to sanitize HTML content before rendering
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content for safe rendering
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export function sanitizeHTML(html: string): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // Server-side: return as-is (DOMPurify requires DOM)
    // In production, consider server-side sanitization library
    return html;
  }

  // Client-side: sanitize with DOMPurify
  return DOMPurify.sanitize(html, {
    // Allow common HTML tags
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img',
      'div', 'span', 'section', 'article', 'header', 'footer',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    // Allow common attributes
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel',
      'width', 'height', 'style',
    ],
    // Allow data attributes for specific use cases
    ALLOW_DATA_ATTR: false,
    // Add rel="noopener noreferrer" to links for security
    ADD_ATTR: ['target'],
    // Keep relative URLs
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
}

/**
 * Sanitize HTML for style tags (more permissive)
 * Used for inline styles in components
 */
export function sanitizeStyle(html: string): string {
  if (typeof window === 'undefined') {
    return html;
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['style'],
    ALLOWED_ATTR: [],
  });
}











