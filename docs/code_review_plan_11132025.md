# NFE Portal – Code Review Plan

This document outlines the structured checklist and evaluation framework for conducting a comprehensive code review of the NFE Portal. It should be used by the developer to perform the review and produce the final remediation plan.

---

## 1. Foundational Architecture Review
### 1.1 System Architecture Alignment
- Validate alignment with documented monolithic Next.js 14 architecture.
- Ensure public, focus group, and admin routes match specification.
- Confirm separation of client/server components.

### 1.2 Folder & Route Structure Validation
- Compare actual folder structure with documented architecture.
- Identify missing, extra, or misplaced directories.
- Identify `.jsx` files that should be `.tsx`.

### 1.3 Architectural Assumption Verification
- Confirm default server component usage.
- Confirm client components only where needed.
- Ensure heavy components are dynamically imported.

---

## 2. Technology Stack Audit
### 2.1 Framework Implementation
- Validate Next.js 14 App Router conventions.
- Check server vs client component usage.

### 2.2 TypeScript Review
- Identify type inconsistencies.
- Remove `@ts-ignore` where possible.
- Validate Supabase type generation.

### 2.3 Dependency Audit
- Identify unused dependencies.
- Flag outdated or deprecated packages.
- Plan for removal of legacy Prisma.

---

## 3. Database & Schema Review
### 3.1 Supabase Migration Validation
- Compare schema in Supabase to documented model.

### 3.2 Profiles Table
- Validate fields, constraints, and types.
- Ensure all profile fields map correctly from UI → API → DB.

### 3.3 Feedback Table
- Confirm whether 1–5 or 1–10 format is used.
- Identify UI/API/DB mismatches.
- Verify duplicate week prevention.

### 3.4 Images Table
- Confirm week association fields.
- Validate signed URL or path-based storage approach.

### 3.5 Row Level Security (RLS)
- Test actual RLS rules:
  - Users can only read/write their own data
  - Admins have full access

### 3.6 Prisma Legacy Removal
- Identify all remaining Prisma files.
- Prepare removal plan.

---

## 4. Authentication & Security Review
### 4.1 Authentication Flow Review
- Registration
- Login
- Token refresh
- Session persistence

### 4.2 Route Protection
- Validate `/focus-group/layout.tsx` redirection.
- Confirm server-side auth enforcement.
- Ensure admin-only routes are protected.

### 4.3 Token Storage
- Evaluate LocalStorage usage.
- Recommend cookie-based auth for protected routes.

### 4.4 Security Audit (OWASP)
- XSS exposure
- CSRF exposure
- File upload security
- Error leakage risks

---

## 5. API Route Review
### 5.1 Architecture & Consistency
- Validate each API route against documented structure.
- Standardize response shapes.

### 5.2 Input Validation
- Confirm Zod schemas exist and are enforced.

### 5.3 Error Handling
- Standardize status codes across endpoints.

### 5.4 Business Logic
- Verify week calculation logic.
- Confirm file upload validation.
- Ensure duplicate feedback prevention.

### 5.5 Performance
- Identify blocking operations.

---

## 6. Frontend Architecture Review
### 6.1 Component Organization
- Validate folder structure and separation of concerns.

### 6.2 Component Quality
- Reusability
- Naming conventions
- Prop interface consistency

### 6.3 State Management
- RHF usage correctness
- Server-state vs client-state review
- Autosave logic validation

### 6.4 UX Review
- Form usability
- Upload flow UX
- Validation error clarity

---

## 7. Focus Group Feature Review
### 7.1 Profile Form
- Confirm all sections implemented.
- Confirm autosave.

### 7.2 Weekly Feedback
- Validate week detection.
- Check 1–10 vs 1–5 mismatch.

### 7.3 Upload System
- Validate drag-and-drop functionality.
- Validate week-number association.
- Validate consent handling.

### 7.4 Enclave System
- Confirm per-user isolation.
- Confirm admin enclave access.

---

## 8. Performance Review
### 8.1 Lighthouse Audit
- LCP, INP, CLS, TTI

### 8.2 Code Splitting
- Ensure dynamic imports for heavier modules.

### 8.3 Asset Optimization
- Proper usage of Next/Image.

---

## 9. Accessibility Review
### 9.1 WCAG 2.1 AA Compliance
- Keyboard navigation
- Focus management
- Screen reader support

### 9.2 Motion Preferences
- Ensure animation respects `prefers-reduced-motion`.

---

## 10. Testing Review
### 10.1 E2E Coverage
- Navigation
- Accessibility
- Focus group flows (add if missing)

### 10.2 Unit Tests
- Zod validation
- Week calculation logic
- Storage utilities

### 10.3 Missing Test Coverage
- Admin routes
- Error scenarios
- API integration

---

## 11. Deployment & Infrastructure Review
### 11.1 Vercel Review
- Environment variables
- ISR coverage
- Cache control

### 11.2 Supabase Infrastructure
- Storage
- Buckets
- Functions

### 11.3 CI/CD Pipeline
- Linting
- TypeScript
- Test runs

---

## 12. Documentation Review
### 12.1 Internal Documentation
- Confirm README accuracy.
- Confirm dev setup instructions are correct.

### 12.2 API Documentation
- Ensure request/response formats documented.

### 12.3 Code Comments
- Validate documentation for complex logic.

---

## 13. Issue Identification & Technical Debt
### 13.1 Broken or Missing Features
### 13.2 Schema/API/UI Mismatches
### 13.3 Architectural Risks
### 13.4 Security Issues
### 13.5 Critical Fixes
### 13.6 High/Medium/Low Priority Backlog

---

## 14. Final Deliverables
The developer must produce:
- Full written code review following this outline
- Remediation plan with priority levels:
  - Critical (fix immediately)
  - High (week 3)
  - Medium (week 4)
  - Low (post-launch)
- Week 3 execution plan
- PRs or diffs tied to each fix
- Confirmation that focus group workflows no longer hang or stall

---

**End of Code Review Plan**

