# E2E Testing Guide

This directory contains end-to-end (E2E) tests for the NFE Portal using Playwright.

## Test Files

- `focus-group.spec.ts` - Comprehensive E2E tests for Focus Group flows (registration, login, profile, feedback, uploads)
- `navigation.spec.ts` - Navigation and routing tests
- `products.spec.ts` - Product page tests
- `learn.spec.ts` - Learn page tests
- `accessibility.spec.ts` - Accessibility tests
- `accessibility-enhanced.spec.ts` - Enhanced accessibility tests

## Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Test File
```bash
npx playwright test tests/focus-group.spec.ts
```

### Run Tests in UI Mode
```bash
npx playwright test --ui
```

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

### Run Tests for Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Configuration

Tests are configured in `playwright.config.ts`. The configuration includes:
- Base URL: `http://localhost:3000`
- Automatic server startup (runs `npm run dev`)
- Multiple browser projects (Chromium, Firefox, WebKit)
- HTML reporter for test results

## Focus Group Tests

The Focus Group E2E tests (`focus-group.spec.ts`) cover:

### 1. Registration Flow
- ✅ New user registration
- ✅ Form validation
- ✅ Password mismatch handling
- ✅ Redirect to profile after registration

### 2. Login Flow
- ✅ Login with valid credentials
- ✅ Error handling for invalid credentials
- ✅ Toggle between login and registration forms

### 3. Profile Management
- ✅ Display profile form with all sections
- ✅ Fill and submit profile form
- ✅ Navigation to feedback page

### 4. Feedback Submission
- ✅ Display feedback form
- ✅ Submit feedback
- ✅ Display feedback history
- ✅ Navigation to upload page

### 5. Upload Functionality
- ✅ Display upload form and gallery
- ✅ Handle file uploads
- ✅ Display upload gallery
- ✅ Navigation to feedback page

### 6. Navigation and Layout
- ✅ Header navigation links
- ✅ Page navigation
- ✅ Sign out functionality

### 7. Accessibility
- ✅ Heading hierarchy
- ✅ Form labels
- ✅ Skip to content link

## Test Credentials

For tests that require authentication, you can set test credentials via environment variables:

```bash
# Set test user credentials
export TEST_USER_EMAIL="test@example.com"
export TEST_USER_PASSWORD="TestPassword123!"

# Or create a .env.test file
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
```

**Note**: The registration tests create unique test users automatically, but login/profile/feedback/upload tests require a pre-existing test user.

## Creating a Test User

To create a test user for E2E testing, use the setup script:

```bash
npm run test:setup
```

This will:
- Create a test user in Supabase (or verify existing one)
- Auto-confirm the email (no email verification needed)
- Show the user ID and email for reference

You can also customize the test user credentials:

```bash
TEST_USER_EMAIL=my-test@example.com TEST_USER_PASSWORD=MyPassword123! npm run test:setup
```

Alternatively:
1. Run the registration test once (creates unique users), or
2. Manually create a user via the registration form, or
3. Use Supabase dashboard to create a test user

## Test Data Cleanup

Clean up test data using the cleanup script:

```bash
# Clean up all test users (matches email pattern: test-.*@example.com)
npm run test:cleanup

# Clean up specific user by email
node scripts/cleanup-test-data.js user@example.com

# Dry run (see what would be deleted without actually deleting)
DRY_RUN=true npm run test:cleanup
```

The cleanup script will:
- Find all test users (emails containing "test" or matching pattern)
- Delete their feedback entries
- Delete their image uploads
- Delete their profiles
- Delete the users themselves

**Note**: Be careful when running cleanup - it will delete all test data!

## Debugging Tests

### View Test Results
```bash
npx playwright show-report
```

### Run Single Test
```bash
npx playwright test tests/focus-group.spec.ts -g "should register a new user"
```

### Debug Mode
```bash
npx playwright test --debug tests/focus-group.spec.ts
```

### Screenshots and Videos
Playwright automatically captures screenshots on failure and videos of test runs (if configured). Check the `test-results/` directory.

## CI/CD Integration

For CI/CD pipelines, set the `CI` environment variable:

```bash
CI=true npm run test:e2e
```

This will:
- Run tests in headless mode
- Retry failed tests twice
- Use a single worker for stability

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Clean up test data after each test run
3. **Wait Strategies**: Use proper wait strategies (waitForURL, waitForSelector) instead of fixed timeouts
4. **Selectors**: Prefer role-based selectors (`getByRole`) over CSS selectors
5. **Error Handling**: Tests should handle both success and error scenarios

## Troubleshooting

### Tests Failing Due to Authentication
- Ensure test user exists in Supabase
- Check that email confirmation is disabled for test users (in Supabase settings)
- Verify environment variables are set correctly

### Tests Timing Out
- Increase timeout in test configuration
- Check that the dev server is running
- Verify network connectivity

### Element Not Found
- Use Playwright's codegen to generate reliable selectors: `npx playwright codegen http://localhost:3000`
- Check that the element is actually rendered (not hidden by CSS)
- Wait for elements to be visible before interacting

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-test)

