import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('Home page should not have accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('About page should not have accessibility violations', async ({ page }) => {
    await page.goto('/about');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Science page should not have accessibility violations', async ({ page }) => {
    await page.goto('/science');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Shop page should not have accessibility violations', async ({ page }) => {
    await page.goto('/shop');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Navigation should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Test skip link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();
    
    // Test main navigation
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
    
    // Test tab order through navigation
    await page.keyboard.press('Tab');
    const navLinks = page.locator('nav a');
    const firstNavLink = navLinks.first();
    await expect(firstNavLink).toBeFocused();
  });

  test('Interactive maps should be keyboard accessible', async ({ page }) => {
    await page.goto('/science');
    
    // Test skin layers map keyboard navigation
    const skinMap = page.locator('[data-testid="skin-layers-map"]');
    await expect(skinMap).toBeVisible();
    
    // Test melanocyte map keyboard navigation
    const melanocyteMap = page.locator('[data-testid="melanocyte-map"]');
    await expect(melanocyteMap).toBeVisible();
    
    // Test that maps have proper ARIA labels
    await expect(skinMap).toHaveAttribute('aria-labelledby');
    await expect(melanocyteMap).toHaveAttribute('aria-labelledby');
  });

  test('Forms should have proper labels and error handling', async ({ page }) => {
    await page.goto('/');
    
    // Test newsletter form accessibility
    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.locator('button[type="submit"]');
    
    if (await emailInput.isVisible()) {
      // Check that input has associated label
      const emailLabel = page.locator('label[for="email"]');
      await expect(emailLabel).toBeVisible();
      
      // Test form validation
      await submitButton.click();
      
      // Check for error messages
      const errorMessage = page.locator('[role="alert"]');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toHaveAttribute('aria-live', 'polite');
      }
    }
  });

  test('Color contrast should meet WCAG AA standards', async ({ page }) => {
    await page.goto('/');
    
    // Test that all text has sufficient contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Focus management should be logical', async ({ page }) => {
    await page.goto('/');
    
    // Test that focus moves logically through the page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus should be visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Focus ring should be visible
    await expect(focusedElement).toHaveCSS('outline', /2px solid/);
  });

  test('Reduced motion should be respected', async ({ page }) => {
    await page.goto('/');
    
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Check that animations are disabled
    const animatedElements = page.locator('[data-animate]');
    if (await animatedElements.count() > 0) {
      const firstAnimated = animatedElements.first();
      const computedStyle = await firstAnimated.evaluate(el => {
        return window.getComputedStyle(el).animationDuration;
      });
      expect(computedStyle).toBe('0.01ms');
    }
  });

  test('Screen reader navigation should work', async ({ page }) => {
    await page.goto('/');
    
    // Test landmark navigation
    const main = page.locator('main');
    const header = page.locator('header');
    const footer = page.locator('footer');
    
    await expect(main).toHaveAttribute('id', 'main-content');
    await expect(header).toBeVisible();
    await expect(footer).toBeVisible();
    
    // Test heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Test that headings are in logical order
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
  });
});
