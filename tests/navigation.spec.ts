import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to all main pages', async ({ page }) => {
    // Test navigation to About page
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL('/about');
    await expect(page.locator('h1')).toContainText('About NFE');

    // Test navigation to Learn page
    await page.click('a[href="/learn"]');
    await expect(page).toHaveURL('/learn');
    await expect(page.locator('h1')).toContainText('The Science of Melanocyte Diversity');

    // Test navigation to Products page
    await page.click('a[href="/products"]');
    await expect(page).toHaveURL('/products');
    await expect(page.locator('h1')).toContainText('NFE Products');

    // Test navigation to Science page
    await page.click('a[href="/science"]');
    await expect(page).toHaveURL('/science');
    await expect(page.locator('h1')).toContainText('Science');

    // Test navigation to Shop page
    await page.click('a[href="/shop"]');
    await expect(page).toHaveURL('/shop');
    await expect(page.locator('h1')).toContainText('Shop');
  });

  test('should navigate to product detail pages', async ({ page }) => {
    // Navigate to products page
    await page.click('a[href="/products"]');
    await expect(page).toHaveURL('/products');

    // Test Face Elixir navigation
    await page.click('a[href="/products/face-elixir"]');
    await expect(page).toHaveURL('/products/face-elixir');
    await expect(page.locator('h1')).toContainText('Face Elixir');

    // Go back to products
    await page.goBack();
    await expect(page).toHaveURL('/products');

    // Test Body Elixir navigation
    await page.click('a[href="/products/body-elixir"]');
    await expect(page).toHaveURL('/products/body-elixir');
    await expect(page.locator('h1')).toContainText('Body Elixir');
  });

  test('should have proper keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Test skip link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main"]');
    await expect(skipLink).toBeFocused();
    
    // Activate skip link
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('should have accessible navigation landmarks', async ({ page }) => {
    // Check for navigation landmark
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    
    // Check for main landmark
    await expect(page.locator('main[id="main"]')).toBeVisible();
    
    // Check for header landmark
    await expect(page.locator('header')).toBeVisible();
    
    // Check for footer landmark
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Check navigation has proper role
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toBeVisible();
    
    // Check main content has proper role
    const main = page.locator('main[id="main"]');
    await expect(main).toBeVisible();
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });
});
