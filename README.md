# NFE Portal

**Not For Everyone** - A secure focus group portal with interactive science visualization for melanated skin research.

## 🎯 Project Status

- **Week 1**: ✅ Foundations & System Setup - COMPLETED
- **Week 2**: ✅ Public Site Core + Design System - COMPLETED
- **Week 3**: 🚧 Focus Group Enclaves + Interactive Maps - PENDING
- **Week 4**: 📋 Articles, Admin Dashboard, QA & Launch - PLANNED

**Current Version**: Week 2 Complete  
**Live Site**: https://nfe-portal-dev.vercel.app  
**Local Dev Server**: http://localhost:3006

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git installed
- A code editor (VS Code recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/vanmbrown/nfe-portal.git

# Navigate to project directory
cd nfe-portal

# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:3000` (or next available port).

---

## 📁 Project Structure

```
nfe-portal/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── about/             # About page
│   │   ├── learn/             # Learn/science page
│   │   ├── products/          # Product pages
│   │   ├── science/           # Science placeholder
│   │   └── shop/              # Shop placeholder
│   ├── components/            # React components
│   │   ├── ui/               # UI primitives (Button, Input, Card, etc.)
│   │   ├── forms/            # Form components (NewsletterSignup)
│   │   ├── interactive/      # Interactive maps (placeholders)
│   │   ├── layout/           # Layout components (Header, Footer, Nav)
│   │   ├── motion/           # Animation components (FadeIn, ScrollReveal)
│   │   ├── products/         # Product page components
│   │   └── shared/           # Shared components (CookieConsent, etc.)
│   ├── content/              # Content data files
│   │   └── products/         # Product data (TypeScript objects)
│   ├── lib/                  # Utility functions
│   │   ├── analytics.ts      # GA4 integration
│   │   ├── auth.ts           # Auth stubs (Week 3)
│   │   ├── db/               # Supabase client
│   │   ├── motion/           # Framer Motion variants
│   │   ├── seo/              # SEO helpers and schemas
│   │   ├── storage/          # Cloudinary stubs (Week 3)
│   │   ├── utils.ts          # Utility functions
│   │   └── validation/       # Zod schemas
│   └── styles/               # Global styles
│       ├── globals.scss      # Global CSS + Tailwind imports
│       └── tokens.scss       # Design tokens (colors, spacing, etc.)
├── tests/                    # Playwright tests
│   ├── accessibility.spec.ts # Basic a11y tests
│   ├── navigation.spec.ts    # Navigation tests
│   ├── products.spec.ts      # Product page tests
│   └── learn.spec.ts         # Learn page tests
├── .lighthouserc.js          # Lighthouse CI config
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS config
└── tsconfig.json             # TypeScript config
```

---

## 🎨 Design System

### Brand Colors
- **NFE Green**: `#103B2A` (Pantone 3435C) - Primary brand color
- **NFE Gold**: `#C6A664` (Pantone 873C) - Accent color
- **NFE Ink**: `#111111` - Primary text
- **NFE Paper**: `#FAFAF8` - Background
- **NFE Muted**: `#6B6B6B` - Secondary text

### Typography
- **Primary Font**: EB Garamond (serif) - Headings and editorial content
- **UI Font**: Inter (sans-serif) - Interface and body text
- **Fallback Stack**: System UI fonts for performance

### Spacing Scale
Based on 4px increments: `4px, 8px, 12px, 16px, 24px, 32px, 40px, 48px`

### Motion
- **Fast**: 120ms - Micro-interactions
- **Base**: 180ms - Standard transitions
- **Slow**: 240ms - Page transitions
- **Respects**: `prefers-reduced-motion` user preference

---

## ✨ Features Implemented

### Week 1 - Foundation ✅
- Next.js 14.2.0 with App Router
- TypeScript strict mode
- Tailwind CSS + SCSS Modules
- Design token system
- Accessibility infrastructure (WCAG 2.1 AA)
- UI component library (Button, Input, Modal, Card, Badge, Alert, Tooltip)
- Layout system (Header, Footer, Navigation)
- Vercel deployment pipeline

### Week 2 - Public Site ✅
- **Home Page**: Enhanced with animations and interactive elements
- **About Page**: Mission, approach, technology, and commitment sections
- **Learn Page**: Comprehensive melanocyte science content
- **Products**: Full product catalog with Face Elixir and Body Elixir
- **Product Pages**: Hero, INCI lists, benefits, usage guides, FAQs
- **Motion System**: Framer Motion animations (FadeIn, ScrollReveal, StaggerList)
- **Analytics**: GA4 integration with custom event tracking
- **SEO**: Metadata, sitemap, robots.txt, JSON-LD structured data
- **Forms**: Newsletter signup with validation (React Hook Form + Zod)
- **Cookie Consent**: Privacy-compliant consent management

### Week 3 - Planned 🚧
- Focus Group Enclaves (secure per-user spaces)
- User authentication (Supabase)
- File upload system (Cloudinary)
- Interactive science maps (dynamic import)
- Data isolation and security

### Week 4 - Planned 📋
- Article templates and CMS
- Admin dashboard
- Performance optimization
- Final QA and pilot testing

---

## 🧪 Testing

### Run Playwright Tests
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test tests/navigation.spec.ts

# Run tests in headed mode (watch browser)
npx playwright test --headed

# Run tests in UI mode
npx playwright test --ui
```

### Accessibility Testing
```bash
# Runs enhanced accessibility tests with axe-core
npm run test:e2e tests/accessibility-enhanced.spec.ts
```

### Lighthouse CI
```bash
# Run Lighthouse performance and accessibility audits
npm run lhci
```

---

## 🔧 Development Scripts

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Start production server (after build)
npm start

# Run linter
npm run lint

# Format code with Prettier
npm run format

# Run all Playwright tests
npm run test:e2e

# Run Lighthouse CI
npm run lhci

# Analyze bundle size
npm run analyze
```

---

## 🌍 Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase (Week 3)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

# Cloudinary (Week 3)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=""

# Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

**Note**: Supabase and Cloudinary integration will be implemented in Week 3.

---

## 🎯 Accessibility Standards

This project maintains **WCAG 2.1 AA compliance**:

- ✅ **Keyboard Navigation**: All interactive elements accessible via keyboard
- ✅ **Screen Readers**: Proper semantic HTML and ARIA labels
- ✅ **Focus Management**: Visible focus indicators throughout
- ✅ **Color Contrast**: Minimum 4.5:1 ratio for text
- ✅ **Motion**: Respects `prefers-reduced-motion`
- ✅ **Form Labels**: All inputs properly labeled
- ✅ **Skip Links**: Skip to main content functionality
- ✅ **ARIA Attributes**: Proper use of roles, labels, and states

---

## 📊 Performance Targets

### Lighthouse CI Thresholds
- **Performance**: ≥ 85
- **Accessibility**: ≥ 90
- **Best Practices**: ≥ 90
- **SEO**: ≥ 90

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: ≤ 2.5s
- **FID (First Input Delay)**: ≤ 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **INP (Interaction to Next Paint)**: ≤ 200ms

---

## 🚢 Deployment

### Vercel (Recommended)

This project is optimized for Vercel deployment:

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables**:
   - Add environment variables in Vercel dashboard
   - Set production values for Supabase and Cloudinary

3. **Deploy**:
   - Push to `main` branch triggers automatic deployment
   - Preview deployments for pull requests

### Manual Build

```bash
# Create production build
npm run build

# Test production build locally
npm start

# Build output is in .next/ directory
```

---

## 🛠️ Technology Stack

### Core
- **Framework**: Next.js 14.2.0 (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: React 18

### Styling
- **CSS Framework**: Tailwind CSS 3.x
- **CSS Modules**: SCSS
- **Animation**: Framer Motion

### Backend (Week 3)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Cloudinary

### Tools & Testing
- **Linting**: ESLint + eslint-plugin-jsx-a11y
- **Formatting**: Prettier
- **Testing**: Playwright + axe-core
- **CI/CD**: Vercel + Lighthouse CI
- **Analytics**: Google Analytics 4

### Forms & Validation
- **Form Management**: React Hook Form
- **Validation**: Zod
- **Icons**: Lucide React

---

## 📚 Documentation

- **Week 1 Report**: See `c:\nfe_dev\weekly_reports\week1_technical_report.md`
- **Week 2 Report**: See `c:\nfe_dev\weekly_reports\week2_technical_report.md`
- **Component Documentation**: See individual component files for JSDoc comments
- **API Documentation**: Coming in Week 3 with backend integration

---

## 🤝 Contributing

This is a private research project. For questions or support:

1. Review the weekly technical reports
2. Check the component documentation
3. Ensure all tests pass before committing
4. Follow the established code style (ESLint + Prettier)
5. Maintain WCAG 2.1 AA compliance

---

## 📝 License

Proprietary - Not For Everyone (NFE) Research Project

---

## 🎉 Acknowledgments

- **Design System**: NFE Brand Guidelines
- **Accessibility**: WCAG 2.1 AA Standards
- **Performance**: Core Web Vitals Best Practices
- **Testing**: Playwright + axe-core communities

---

**Current Status**: Week 2 Complete ✅  
**Next Milestone**: Week 3 - Focus Group Enclaves  
**Last Updated**: October 25, 2025
