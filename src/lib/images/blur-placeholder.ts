/**
 * Blur placeholder utilities for Next.js Image components
 * 
 * Generates base64-encoded blur placeholders for images
 * These are lightweight placeholders that show while images load
 */

/**
 * Generate a simple blur placeholder data URL
 * This creates a tiny 10x10px image with a solid color
 * 
 * @param color - Hex color code (default: #e5e7eb - light gray)
 * @returns Base64-encoded data URL for use with Next.js Image placeholder="blur"
 */
export function generateBlurPlaceholder(color: string = '#e5e7eb'): string {
  // Create a tiny 10x10px canvas
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (!canvas) {
    // Fallback for SSR - return a minimal base64 placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTdlOWViIi8+PC9zdmc+';
  }
  
  canvas.width = 10;
  canvas.height = 10;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTdlOWViIi8+PC9zdmc+';
  }
  
  // Fill with color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 10, 10);
  
  return canvas.toDataURL();
}

/**
 * Predefined blur placeholders for common image types
 */
export const blurPlaceholders = {
  // Product images - dark green background
  product: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMGYyYzFjIi8+PC9zdmc+',
  
  // Hero images - warm beige background
  hero: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjhmNWYyIi8+PC9zdmc+',
  
  // Article images - light gray background
  article: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTdlOWViIi8+PC9zdmc+',
  
  // Default - light gray
  default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTdlOWViIi8+PC9zdmc+',
};

