# Lighthouse Audit Guide

## Quick Start

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Run Lighthouse audit**:
   ```bash
   node scripts/run-lighthouse.js
   ```

3. **View results**:
   - Summary: `lighthouse-reports/summary.md`
   - Individual reports: `lighthouse-reports/*.html`

## Using Lighthouse CI

For CI/CD integration:

```bash
npm run lhci
```

This uses the `.lighthouserc.js` configuration file.

## Manual Audit

To audit a specific page manually:

```bash
npx lighthouse http://localhost:3000 --view
```

## Target Scores

- **Performance**: ≥ 70
- **Accessibility**: ≥ 90
- **Best Practices**: ≥ 80
- **SEO**: ≥ 80

## Common Issues & Fixes

### Performance
- **Large images**: Use Next.js Image component (already implemented)
- **Unused JavaScript**: Code splitting, dynamic imports
- **Render-blocking resources**: Optimize CSS, defer non-critical JS

### Accessibility
- **Color contrast**: Ensure WCAG AA compliance
- **ARIA labels**: Add proper labels to interactive elements
- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible

### Best Practices
- **HTTPS**: Ensure production uses HTTPS
- **Console errors**: Fix any console errors
- **Image optimization**: Use appropriate image formats and sizes

### SEO
- **Meta tags**: Ensure all pages have proper meta tags
- **Structured data**: Add JSON-LD structured data
- **Sitemap**: Ensure sitemap.xml is accessible

