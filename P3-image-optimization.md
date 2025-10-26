# P3: Image Optimization - NFE Portal

**Priority:** P3 (Low - Post-Week 2)  
**Sprint:** Week 3 or Week 4  
**Assigned To:** TBD  
**Status:** 📋 Backlog

---

## Overview

Optimize all images in the NFE Portal for performance by converting to modern formats (WebP/AVIF), generating blur placeholders, and ensuring proper use of Next.js `Image` component.

---

## Background

During Week 2 development, we focused on functionality and accessibility. Image optimization was deferred to avoid blocking core feature development. Currently:

- Product images are placeholders
- Some images may use standard `<img>` tags instead of `next/image`
- No blur placeholders implemented
- No WebP/AVIF conversions

---

## Acceptance Criteria

### 1. Image Audit
- [ ] Identify all images currently in use
- [ ] List images using `<img>` vs `next/image`
- [ ] Document current file sizes and formats
- [ ] Create optimization plan

### 2. Next.js Image Component
- [ ] Replace all `<img>` tags with `next/image`
- [ ] Add proper `width` and `height` props
- [ ] Set appropriate `sizes` attribute for responsive images
- [ ] Use `priority` flag for above-the-fold images

### 3. Image Format Conversion
- [ ] Convert all JPG/PNG images to WebP
- [ ] Generate AVIF versions for supported browsers
- [ ] Keep originals as fallbacks
- [ ] Update image paths in components

### 4. Blur Placeholders
- [ ] Generate blur data URLs for all images
- [ ] Add `placeholder="blur"` to Image components
- [ ] Use `blurDataURL` for custom placeholders
- [ ] Test loading states

### 5. Image Optimization
- [ ] Compress images without quality loss
- [ ] Resize images to maximum needed dimensions
- [ ] Remove unnecessary metadata
- [ ] Optimize for web delivery

### 6. Performance Verification
- [ ] Run Lighthouse before/after
- [ ] Measure LCP improvement
- [ ] Verify CLS remains low
- [ ] Document file size reductions

---

## Current Image Inventory

### Product Images (Placeholders)
- `/images/products/face-elixir-hero.jpg` - PLACEHOLDER
- `/images/products/face-elixir-detail.jpg` - PLACEHOLDER
- `/images/products/body-elixir-hero.jpg` - PLACEHOLDER
- `/images/products/body-elixir-detail.jpg` - PLACEHOLDER

**Status:** These are currently 404 errors, need actual assets

### Other Images
_To be determined during image audit_

---

## Implementation Plan

### Phase 1: Audit (30 minutes)
1. Search codebase for `<img` tags
2. Search for `Image` component usage
3. List all image files in `/public/images/`
4. Document current vs optimal state

### Phase 2: Component Updates (1-2 hours)
1. Replace `<img>` with `next/image` where found
2. Add proper props (width, height, alt, sizes)
3. Set `priority` for hero images
4. Update import statements

### Phase 3: Image Processing (2-3 hours)
1. Convert images to WebP using tools like:
   - `sharp` (Node.js)
   - `cwebp` (command line)
   - Online tools (e.g., Squoosh)
2. Generate AVIF versions
3. Compress all formats
4. Create blur placeholders

### Phase 4: Deployment (30 minutes)
1. Upload optimized images to `/public/images/`
2. Update Cloudinary if using CDN (Week 3)
3. Test on staging
4. Deploy to production

### Phase 5: Verification (1 hour)
1. Run Lighthouse audits
2. Test on slow 3G
3. Verify image loading
4. Check mobile performance

---

## Tools and Resources

### Image Optimization Tools
- **sharp** - https://sharp.pixelplumbing.com/
- **Squoosh** - https://squoosh.app/
- **ImageOptim** - https://imageoptim.com/
- **next/image** - https://nextjs.org/docs/api-reference/next/image

### Blur Placeholder Generation
```bash
npm install plaiceholder
```

```javascript
import { getPlaiceholder } from 'plaiceholder';

const { base64 } = await getPlaiceholder('/images/hero.jpg');
```

### Batch Conversion Script
```bash
# Convert all JPG to WebP
for img in public/images/**/*.jpg; do
  cwebp -q 85 "$img" -o "${img%.jpg}.webp"
done
```

---

## Expected Impact

### Performance Improvements
- **LCP:** Improve by 0.5-1.5s
- **File Size:** Reduce by 40-70%
- **Bandwidth:** Save ~60% on image data
- **CLS:** Maintain < 0.1 (prevent with proper dimensions)

### User Experience
- Faster page loads
- Smoother image loading
- Better mobile experience
- Less data usage

---

## Dependencies

### Blockers
- None (can be done independently)

### Nice-to-Have
- Cloudinary integration (Week 3) for automatic optimization
- CDN setup for faster delivery
- Responsive image sets

---

## Testing Checklist

- [ ] All images load correctly
- [ ] No 404 errors
- [ ] Blur placeholders appear while loading
- [ ] Images sharp and clear (no over-compression)
- [ ] Responsive images work at all breakpoints
- [ ] Lighthouse performance score improves
- [ ] LCP metric improves
- [ ] CLS remains low
- [ ] Works across all browsers
- [ ] Mobile performance acceptable

---

## Success Metrics

| Metric | Before | After | Target Improvement |
|--------|--------|-------|-------------------|
| LCP | ___ s | ___ s | -0.5s to -1.5s |
| Total Image Size | ___ KB | ___ KB | -40% to -70% |
| Lighthouse Performance | ___ | ___ | +5 to +15 points |
| Page Load Time | ___ s | ___ s | -0.5s to -1s |

---

## Notes

### Why P3?
- Not blocking Week 2 completion
- Performance is acceptable with current implementation
- Can be done incrementally
- Requires actual product images (coming later)

### Why Important?
- Significant performance gains
- Better user experience
- Lower bandwidth costs
- Improved SEO
- Professional polish

---

## References

- Next.js Image Optimization: https://nextjs.org/docs/basic-features/image-optimization
- Web.dev Image Performance: https://web.dev/fast/#optimize-your-images
- Vercel Image Optimization: https://vercel.com/docs/concepts/image-optimization

---

**Created:** October 25, 2025  
**Priority:** P3 (Post-Week 2)  
**Estimated Effort:** 4-6 hours  
**Sprint:** Week 3 or Week 4

