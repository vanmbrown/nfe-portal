# E2E Testing Guide

This guide covers end-to-end (E2E) testing for the NFE Portal Focus Group features.

## Quick Start

1. **Set up test user:**
   ```bash
   npm run test:setup
   ```

2. **Run E2E tests:**
   ```bash
   npm run test:e2e
   ```

3. **Clean up test data (optional):**
   ```bash
   npm run test:cleanup
   ```

## Test Infrastructure

### Test Framework
- **Playwright** - Modern E2E testing framework
- **TypeScript** - Type-safe test code
- **Multiple browsers** - Chromium, Firefox, WebKit

### Test Files
- `tests/focus-group.spec.ts` - Main E2E test suite
- `tests/helpers/auth.ts` - Authentication helpers
- `tests/README.md` - Detailed testing documentation

### Utility Scripts
- `scripts/setup-test-user.js` - Create test user in Supabase
- `scripts/cleanup-test-data.js` - Clean up test data

## Test User Setup

### Automatic Setup
```bash
npm run test:setup
```

This script:
- Creates a test user in Supabase (or verifies existing one)
- Auto-confirms email (no verification needed)
- Uses credentials from environment or defaults

### Custom Credentials
```bash
TEST_USER_EMAIL=my-test@example.com \
TEST_USER_PASSWORD=MyPassword123! \
npm run test:setup
```

### Environment Variables
Set in `.env.local` or export before running:
- `TEST_USER_EMAIL` - Email for test user (default: `test@example.com`)
- `TEST_USER_PASSWORD` - Password for test user (default: `TestPassword123!`)

## Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Test File
```bash
npx playwright test tests/focus-group.spec.ts
```

### Run Specific Test
```bash
npx playwright test tests/focus-group.spec.ts -g "should register a new user"
```

### Interactive Mode
```bash
npx playwright test --ui
```

### Debug Mode
```bash
npx playwright test --debug
```

## Test Coverage

### Registration Flow
- ✅ New user registration
- ✅ Form validation
- ✅ Password mismatch handling
- ✅ Redirect to profile after registration

### Login Flow
- ✅ Login with valid credentials
- ✅ Error handling for invalid credentials
- ✅ Toggle between login and registration forms

### Profile Management
- ✅ Display profile form with all sections
- ✅ Fill and submit profile form
- ✅ Navigation to feedback page

### Feedback Submission
- ✅ Display feedback form
- ✅ Submit feedback
- ✅ Display feedback history
- ✅ Navigation to upload page

### Upload Functionality
- ✅ Display upload form and gallery
- ✅ Handle file uploads
- ✅ Display upload gallery
- ✅ Navigation to feedback page

### Navigation and Layout
- ✅ Header navigation links
- ✅ Page navigation
- ✅ Sign out functionality

### Accessibility
- ✅ Heading hierarchy
- ✅ Form labels
- ✅ Skip to content link

## Test Data Cleanup

### Clean Up All Test Users
```bash
npm run test:cleanup
```

This will:
- Find all test users (emails containing "test" or matching pattern)
- Delete their feedback entries
- Delete their image uploads
- Delete their profiles
- Delete the users themselves

### Clean Up Specific User
```bash
node scripts/cleanup-test-data.js user@example.com
```

### Dry Run
```bash
DRY_RUN=true npm run test:cleanup
```

Shows what would be deleted without actually deleting.

### Custom Email Pattern
```bash
TEST_EMAIL_PATTERN="test-.*@example.com" npm run test:cleanup
```

## Test Helpers

### Authentication Helpers
Located in `tests/helpers/auth.ts`:

```typescript
import { loginAsTestUser, generateTestEmail, getTestUser } from './helpers/auth';

// Login as test user
await loginAsTestUser(page);

// Generate unique test email
const email = generateTestEmail();

// Get test user credentials
const user = getTestUser();
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:setup
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
      - run: npm run test:e2e
        env:
          CI: true
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests Failing Due to Authentication
- Ensure test user exists: `npm run test:setup`
- Check environment variables are set correctly
- Verify Supabase credentials in `.env.local`

### Tests Timing Out
- Increase timeout in test configuration
- Check that dev server is running (`npm run dev`)
- Verify network connectivity

### Element Not Found
- Use Playwright's codegen: `npx playwright codegen http://localhost:3000`
- Check that element is actually rendered (not hidden by CSS)
- Wait for elements to be visible before interacting

### Test User Already Exists
- The setup script will detect and use existing users
- Or clean up first: `npm run test:cleanup`

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up test data after test runs
3. **Wait Strategies**: Use proper wait strategies instead of fixed timeouts
4. **Selectors**: Prefer role-based selectors (`getByRole`) over CSS selectors
5. **Error Handling**: Tests should handle both success and error scenarios
6. **Test Data**: Use unique test data (unique emails, etc.) to avoid conflicts

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-test)
- [Tests README](./tests/README.md) - Detailed test documentation




