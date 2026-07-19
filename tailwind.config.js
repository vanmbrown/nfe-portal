/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/stories/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- EXISTING. Do not rename, do not remove, do not change values. ---
        'nfe-green': '#103B2A',
        'nfe-green-900': '#0b291e',
        'nfe-green-800': '#1B3A34',
        'nfe-green-700': '#14543c',
        'nfe-gold': '#C6A664',
        'nfe-gold-hover': '#b78f3c',
        'nfe-ink': '#111111',
        'nfe-paper': '#FAFAF8',
        'nfe-muted': '#6B6B6B',

        // --- MAISON TOKEN BRIDGE (Phase 1). Additive. Not yet used by any
        // component. Values read through to src/styles/nfe-tokens.css so
        // there is one source of truth. See docs/nfe-maison-token-map.md.
        //
        // Accent is mapped BY SURFACE ROLE, per the ratified DDR-7 ruling.
        // Do not use one accent universally across all backgrounds.
        'maison-accent-on-light': 'var(--maison-accent-on-light)', // #77633C
        'maison-accent-on-dark': 'var(--maison-accent-on-dark)',   // #C6A664
        'maison-bone': 'var(--maison-bone)',
        'maison-ivory': 'var(--maison-ivory)',
        'maison-parchment': 'var(--maison-parchment)',
        'maison-cacao': 'var(--maison-cacao)',
        'maison-espresso': 'var(--maison-espresso)',
        'maison-umber': 'var(--maison-umber)',
        'maison-hairline': 'var(--maison-hairline)',
        'maison-text-muted': 'var(--maison-text-muted)',             // proposed
        'maison-text-subtle-on-dark': 'var(--maison-text-subtle-on-dark)', // proposed
      },
      fontFamily: {
        // Sans stays Inter (DDR-2). Figtree deferred. Serif is declared here
        // but NOT loaded: Garamond web embedding is not approved, so real
        // visitors resolve to the Georgia fallback. Do not add next/font/local
        // until the license is confirmed.
        'primary': ['Garamond Premier Pro', 'Georgia', 'serif'],
        'ui': ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial'],
      },
      // --- MAISON additions. Namespaced to avoid the F-Spacing-01 collision:
      // production spacing is 4px-base, the design package is 8px-base under
      // identical names. These sit alongside, they do not redefine.
      spacing: {
        'maison-section': 'var(--maison-space-12)', // 96px
      },
      maxWidth: {
        'maison': '72rem',
        'maison-measure': '65ch', // editorial body measure
      },
      borderRadius: {
        'maison-editorial': 'var(--maison-radius-editorial)', // 0px
        'maison-control': 'var(--maison-radius-control)',     // 2px
        'maison-input': 'var(--maison-radius-input)',         // 4px
      },
    },
  },
  plugins: [],
}


