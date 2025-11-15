/**
 * Authentication helpers for E2E tests
 */

import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
}

/**
 * Get test user credentials from environment or use defaults
 */
export function getTestUser(): TestUser {
  return {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
  };
}

/**
 * Login as test user
 */
export async function loginAsTestUser(page: Page, user?: TestUser): Promise<void> {
  const testUser = user || getTestUser();
  
  await page.goto('/focus-group/login');
  await page.getByLabel(/email/i).fill(testUser.email);
  await page.getByLabel(/password/i).fill(testUser.password);
  await page.getByRole('button', { name: /sign in|login/i }).click();
  
  // Wait for redirect after login
  await page.waitForURL(/\/focus-group\/(profile|feedback)/, { timeout: 10000 });
}

/**
 * Generate unique test email
 */
export function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page, urlPattern: RegExp | string): Promise<void> {
  await page.waitForURL(urlPattern, { timeout: 10000 });
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    const signOutButton = page.getByRole('button', { name: /sign out|logout/i });
    return await signOutButton.isVisible({ timeout: 2000 });
  } catch {
    return false;
  }
}




