/**
 * Test User Setup Helper
 * 
 * Creates test users using Supabase admin API for E2E tests.
 * This bypasses email confirmation requirements.
 */

import { Page } from '@playwright/test';

const { createClient } = require('@supabase/supabase-js');

/**
 * Create a test user using admin API (bypasses email confirmation)
 */
export async function createTestUserWithAdmin(
  email: string,
  password: string = 'TestPassword123!'
): Promise<{ userId: string; email: string } | null> {
  // Get Supabase credentials from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠️  Missing Supabase credentials - cannot create test user via admin API');
    return null;
  }

  try {
    // Create admin client (bypasses RLS)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Check if user already exists
    const { data: existingUser } = await adminClient.auth.admin.getUserByEmail(email);
    
    if (existingUser?.user) {
      // User exists, return it
      return {
        userId: existingUser.user.id,
        email: existingUser.user.email || email,
      };
    }

    // Create new user with email auto-confirmed
    const { data: newUser, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for testing
    });

    if (error) {
      console.error('❌ Failed to create test user:', error.message);
      return null;
    }

    return {
      userId: newUser.user.id,
      email: newUser.user.email || email,
    };
  } catch (error: any) {
    console.error('❌ Error creating test user:', error.message);
    return null;
  }
}

/**
 * Setup test user before registration test
 * This ensures the user can log in immediately after "registration"
 */
export async function setupTestUserForRegistration(
  page: Page,
  email: string,
  password: string = 'TestPassword123!'
): Promise<boolean> {
  // Try to create user via admin API
  const userData = await createTestUserWithAdmin(email, password);
  
  if (userData) {
    // User created successfully, now try to log in
    try {
      await page.goto('/focus-group/login');
      await page.getByLabel(/email/i).fill(email);
      await page.getByLabel(/password/i).fill(password);
      await page.getByRole('button', { name: /sign in|login/i }).click();
      
      // Wait for successful login
      await page.waitForURL(/\/focus-group\/(profile|feedback)/, { timeout: 10000 });
      return true;
    } catch (error) {
      console.warn('⚠️  Failed to auto-login test user:', error);
      return false;
    }
  }
  
  return false;
}

