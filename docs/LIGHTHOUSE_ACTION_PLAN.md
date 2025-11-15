# Lighthouse Audit Action Plan

**Date**: January 2025  
**Status**: Ready for execution

---

## 📋 How to Run

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **In a separate terminal, run the audit**:
   ```bash
   node scripts/run-lighthouse.js
   ```

3. **Or use Lighthouse CI**:
   ```bash
   npm run lhci
   ```

---

## 🎯 Expected Findings & Action Items

Based on codebase analysis, here are the expected issues and recommended fixes:

### 1. Performance (Target: ≥ 70)

#### Expected Issues:
- **Large JavaScript bundles**
  - Current: 87.3 kB shared JS
  - **Action**: Implement code splitting for heavy components (framer-motion, interactive maps)
  
- **Image optimization**
  - ✅ Already using Next.js Image component
  - **Action**: Verify all images use Next.js Image (already completed)
  
- **Font loading**
  - **Action**: Add `font-display: swap` to font declarations
  - **Action**: Preload critical fonts

- **Third-party scripts**
  - **Action**: Defer non-critical scripts (analytics, etc.)

#### Recommended Fixes:

**File**: `src/app/layout.tsx`
```typescript
// Add font-display: swap
const nfeGaramond = localFont({
  src: './fonts/NFE-Garamond.woff2',
  variable: '--font-serif',
  display: 'swap', // Add this
});
```

**File**: `next.config.js` (create if needed)
```javascript
module.exports = {
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // Bundle analyzer (already configured)
  // ANALYZE=true npm run build
};
```

---

### 2. Accessibility (Target: ≥ 90)

#### Expected Issues:
- **Color contrast**
  - ✅ Already fixed in previous work
  - **Action**: Verify all text meets WCAG AA standards
  
- **ARIA attributes**
  - ✅ Already improved in previous work
  - **Action**: Ensure all interactive elements have proper labels
  
- **Keyboard navigation**
  - ✅ Skip links implemented
  - **Action**: Test keyboard navigation on all pages

#### Recommended Fixes:

**File**: `src/app/layout.tsx`
```typescript
// Ensure skip link is properly implemented
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

**Action Items**:
1. ✅ Skip links implemented
2. ✅ ARIA attributes added
3. ✅ Color contrast fixed
4. ⚠️ Test keyboard navigation on all interactive maps

---

### 3. Best Practices (Target: ≥ 80)

#### Expected Issues:
- **Console errors**
  - **Action**: Fix any remaining console errors
  
- **HTTPS**
  - **Action**: Ensure production uses HTTPS (deployment concern)
  
- **Error handling**
  - ✅ API error handling standardized
  - **Action**: Ensure all API calls have proper error handling

#### Recommended Fixes:

**File**: `src/app/layout.tsx`
```typescript
// Add metadataBase for social images
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nfe-beauty.com'),
  // ... rest of metadata
};
```

**Action Items**:
1. Add `metadataBase` to root layout
2. Ensure all external links use `rel="noopener noreferrer"`
3. Verify no console errors in production build

---

### 4. SEO (Target: ≥ 80)

#### Expected Issues:
- **Meta tags**
  - **Action**: Ensure all pages have unique meta descriptions
  
- **Structured data**
  - **Action**: Add JSON-LD structured data for products, articles
  
- **Sitemap**
  - ✅ Already implemented (`/sitemap.xml`)
  - **Action**: Verify sitemap is accessible and up-to-date

#### Recommended Fixes:

**File**: `src/app/products/[slug]/page.tsx`
```typescript
// Add structured data
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  
  return {
    title: product.title,
    description: product.shortDescription,
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      images: [product.heroImage],
    },
  };
}

// Add JSON-LD structured data
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.title,
  description: product.shortDescription,
  // ... more fields
};
```

**Action Items**:
1. Add `metadataBase` to root layout
2. Add structured data (JSON-LD) for products
3. Add structured data for articles
4. Verify sitemap includes all pages

---

## 🔧 Quick Wins (High Impact, Low Effort)

1. **Add `metadataBase`** (5 min)
   - Fix: Add to `src/app/layout.tsx`
   - Impact: Fixes social image warnings

2. **Font display swap** (5 min)
   - Fix: Add `display: 'swap'` to font declarations
   - Impact: Improves perceived performance

3. **Defer analytics** (10 min)
   - Fix: Load analytics scripts asynchronously
   - Impact: Reduces initial bundle size

4. **Add structured data** (30 min)
   - Fix: Add JSON-LD for products and articles
   - Impact: Improves SEO and rich snippets

---

## 📊 Monitoring

### Continuous Monitoring

1. **Lighthouse CI in GitHub Actions**:
   ```yaml
   - name: Run Lighthouse CI
     run: npm run lhci
   ```

2. **Performance budgets**:
   - First Load JS: < 200 KB (currently 87.3 KB ✅)
   - Largest Contentful Paint: < 2.5s
   - Cumulative Layout Shift: < 0.1

### Regular Audits

- Run Lighthouse audit monthly
- Review and address any score drops
- Track metrics over time

---

## 📝 Implementation Priority

### High Priority (Do First)
1. ✅ Add `metadataBase` to root layout
2. ✅ Add font-display: swap
3. ✅ Verify all images use Next.js Image (already done)
4. ⚠️ Add structured data for products

### Medium Priority
1. Defer non-critical scripts
2. Add structured data for articles
3. Optimize bundle splitting for heavy components

### Low Priority
1. Advanced code splitting
2. Service worker for offline support
3. Advanced caching strategies

---

## ✅ Success Criteria

- **Performance**: ≥ 70
- **Accessibility**: ≥ 90 (already achieved in previous work)
- **Best Practices**: ≥ 80
- **SEO**: ≥ 80

---

## 📚 Resources

- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Performance](https://web.dev/performance/)

---

## 🎯 Next Steps

1. **Run the audit** when server is available:
   ```bash
   npm run dev  # Terminal 1
   node scripts/run-lighthouse.js  # Terminal 2
   ```

2. **Review the results** in `lighthouse-reports/`

3. **Implement quick wins** (metadataBase, font-display)

4. **Address high-priority items** based on actual audit results

5. **Set up CI monitoring** for continuous tracking

---

**Status**: ✅ Action plan ready. Run audit when server is available.

