# Cloudflare Turbopack CSS Parsing Error Fix

## Issue
Cloudflare build is failing with:
```
Turbopack build failed with 1 errors: ./src/styles/globals.scss.css:258:57402 
Parsing CSS source code failed Unexpected token in attribute selector: IDHash("D4AF37\\")
```

## Root Cause
Next.js 16 uses Turbopack by default, which has a CSS parsing issue with Tailwind's arbitrary value syntax (e.g., `text-[#D4AF37]`). The color `#D4AF37` is used extensively throughout the codebase in Tailwind arbitrary values.

## Solution
Disable Turbopack for the build by setting an environment variable in Cloudflare Pages.

### Steps to Fix:

1. **Go to Cloudflare Pages Dashboard**
   - Navigate to your project: `nfebeauty.com`
   - Go to **Settings** → **Environment Variables**

2. **Add Environment Variable**
   - **Variable name**: `NEXT_PRIVATE_SKIP_TURBO`
   - **Value**: `1`
   - **Environment**: Production (and Preview if needed)

3. **Redeploy**
   - The next deployment will use webpack instead of Turbopack
   - This will resolve the CSS parsing error

### Alternative: Update Build Command in Cloudflare
If environment variables don't work, you can update the build command in Cloudflare Pages settings:
- Go to **Settings** → **Builds & deployments**
- Change build command from `npm run build` to:
  ```
  NEXT_PRIVATE_SKIP_TURBO=1 npm run build
  ```

## Why This Works
- Turbopack is Next.js 16's new bundler (replacing webpack)
- It has known issues with CSS parsing, especially with Tailwind arbitrary values
- Disabling Turbopack falls back to webpack, which handles the CSS correctly
- The webpack config in `next.config.js` is already set up and working

## Long-term Solution
Consider adding the gold color (`#D4AF37`) to `tailwind.config.js` as a named color to avoid arbitrary values:
```js
colors: {
  'nfe-gold-alt': '#D4AF37', // or update existing 'nfe-gold'
}
```
Then replace `text-[#D4AF37]` with `text-nfe-gold-alt` throughout the codebase.
