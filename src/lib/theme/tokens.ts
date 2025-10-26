/**
 * NFE Portal Design Tokens
 * Single source of truth for design system values
 * Exports both TypeScript constants and CSS custom properties
 */

// Color Palette - NFE Brand Colors
export const colors = {
  // Primary Brand Colors
  green: {
    50: '#f0f9f4',
    100: '#dcf2e3',
    200: '#bce5cc',
    300: '#8dd1a8',
    400: '#56b47d',
    500: '#103B2A', // NFE Green (Pantone 3435C)
    600: '#0b291e',
    700: '#14543c',
    800: '#0d1f17',
    900: '#0a1a13',
  },
  gold: {
    50: '#fdfcf7',
    100: '#faf8ed',
    200: '#f5f0d8',
    300: '#ede4b8',
    400: '#d4c48a',
    500: '#C6A664', // NFE Gold (Pantone 873C)
    600: '#b8954a',
    700: '#9d7d3a',
    800: '#7f652f',
    900: '#6b5428',
  },
  // Neutral Colors
  ink: '#111111',
  paper: '#FAFAF8',
  muted: '#6B6B6B',
  // Semantic Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

// Typography Scale
export const typography = {
  fontFamily: {
    primary: ['Garamond Premier Pro', 'Georgia', 'serif'],
    ui: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'Apple Color Emoji', 'Segoe UI Emoji'],
    mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// Spacing Scale (4px base)
export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem',  // 8px
  3: '0.75rem', // 12px
  4: '1rem',    // 16px
  5: '1.25rem', // 20px
  6: '1.5rem',  // 24px
  8: '2rem',    // 32px
  10: '2.5rem', // 40px
  12: '3rem',   // 48px
  16: '4rem',   // 64px
  20: '5rem',   // 80px
  24: '6rem',   // 96px
  32: '8rem',   // 128px
} as const;

// Motion & Animation
export const motion = {
  duration: {
    fast: '120ms',
    base: '180ms',
    slow: '240ms',
    slower: '300ms',
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Breakpoints (for responsive design)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Focus Ring Configuration
export const focusRing = {
  width: '2px',
  style: 'solid',
  color: colors.gold[500],
  offset: '2px',
} as const;

// Accessibility
export const accessibility = {
  // Minimum contrast ratios
  contrast: {
    normal: 4.5, // WCAG AA for normal text
    large: 3,    // WCAG AA for large text (18pt+ or 14pt+ bold)
    enhanced: 7, // WCAG AAA
  },
  // Motion preferences
  reducedMotion: {
    duration: '0.01ms',
    easing: 'linear',
  },
} as const;

// Export CSS custom properties for use in SCSS
export const cssVariables = {
  '--nfe-green': colors.green[500],
  '--nfe-green-900': colors.green[900],
  '--nfe-green-700': colors.green[700],
  '--nfe-gold': colors.gold[500],
  '--nfe-ink': colors.ink,
  '--nfe-paper': colors.paper,
  '--nfe-muted': colors.muted,
  '--font-primary': typography.fontFamily.primary.join(', '),
  '--font-ui': typography.fontFamily.ui.join(', '),
  '--font-size-root': '16px',
  '--motion-fast': motion.duration.fast,
  '--motion-base': motion.duration.base,
  '--motion-slow': motion.duration.slow,
  '--focus-ring': `${focusRing.width} ${focusRing.style} ${focusRing.color}`,
  '--focus-ring-offset': focusRing.offset,
} as const;

// Type exports for TypeScript usage
export type ColorScale = keyof typeof colors.green;
export type SpacingKey = keyof typeof spacing;
export type MotionDuration = keyof typeof motion.duration;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
