# NFE Portal

Secure focus group enclaves with interactive science layer for NFE research.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_SITE_URL="https://nfe-portal.vercel.app"
```

### 3. Development
```bash
npm run dev
```

### 4. Testing
```bash
# Run accessibility tests
npm run test:e2e

# Run Storybook
npm run storybook

# Run Lighthouse CI
npm run lhci
```

### 5. Build
```bash
npm run build
```

## Project Structure

- `src/app/` - Next.js App Router pages
- `src/components/` - React components
- `src/lib/` - Utility functions and integrations
- `src/styles/` - Global styles and design tokens
- `tests/` - Playwright accessibility tests
- `src/stories/` - Storybook component stories

## Design System

The project uses a custom design system with:
- **Colors**: NFE Green (#103B2A), NFE Gold (#C6A664)
- **Typography**: Garamond Premier Pro (primary), System UI (interface)
- **Spacing**: 4px base scale
- **Motion**: Respects `prefers-reduced-motion`

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader optimized
- Focus management
- Color contrast ratios ≥ 4.5:1

## Performance Targets

- Lighthouse Performance ≥ 85
- Lighthouse Accessibility ≥ 90
- LCP ≤ 3s
- CLS < 0.1
- INP ≤ 200ms

