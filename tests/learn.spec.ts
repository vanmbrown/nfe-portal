import { test, expect } from '@playwright/test';

test.describe('Learn Page Tests', () => {
  test('should display learn page with comprehensive content', async ({ page }) => {
    await page.goto('/learn');
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('The Science of Melanocyte Diversity');
    
    // Check hero section content
    await expect(page.locator('text=Understanding the complex world of melanocytes')).toBeVisible();
    
    // Check badges
    await expect(page.locator('text=Peer-Reviewed Research')).toBeVisible();
    await expect(page.locator('text=Inclusive Studies')).toBeVisible();
    await expect(page.locator('text=Privacy-First')).toBeVisible();
  });

  test('should display melanocyte function section', async ({ page }) => {
    await page.goto('/learn');
    
    // Check section heading
    await expect(page.locator('h2:has-text("Understanding Melanocyte Function")')).toBeVisible();
    
    // Check feature cards
    await expect(page.locator('text=Genetic Diversity')).toBeVisible();
    await expect(page.locator('text=Barrier Protection')).toBeVisible();
    await expect(page.locator('text=Health Implications')).toBeVisible();
    
    // Check pull quote
    await expect(page.locator('blockquote')).toBeVisible();
    await expect(page.locator('text=Dr. Sarah Chen')).toBeVisible();
  });

  test('should display regional variations section', async ({ page }) => {
    await page.goto('/learn');
    
    // Check section heading
    await expect(page.locator('h2:has-text("Regional Variations in Melanocyte Function")')).toBeVisible();
    
    // Check regional cards
    await expect(page.locator('text=African Populations')).toBeVisible();
    await expect(page.locator('text=Asian Populations')).toBeVisible();
    await expect(page.locator('text=European Populations')).toBeVisible();
    await expect(page.locator('text=Indigenous Populations')).toBeVisible();
    await expect(page.locator('text=Latin American Populations')).toBeVisible();
    await expect(page.locator('text=Mixed Heritage')).toBeVisible();
    
    // Check that each card has key information
    await expect(page.locator('text=2-3x higher melanocyte density')).toBeVisible();
    await expect(page.locator('text=Variable melanocyte distribution')).toBeVisible();
    await expect(page.locator('text=Seasonal melanocyte activation')).toBeVisible();
  });

  test('should display research impact section', async ({ page }) => {
    await page.goto('/learn');
    
    // Check section heading
    await expect(page.locator('h2:has-text("Research Impact & Healthcare Implications")')).toBeVisible();
    
    // Check impact cards
    await expect(page.locator('text=Clinical Outcomes')).toBeVisible();
    await expect(page.locator('text=Scientific Publications')).toBeVisible();
    await expect(page.locator('text=Community Impact')).toBeVisible();
    await expect(page.locator('text=Research Partnerships')).toBeVisible();
    
    // Check statistics
    await expect(page.locator('text=40% improvement')).toBeVisible();
    await expect(page.locator('text=15+ peer-reviewed publications')).toBeVisible();
    await expect(page.locator('text=Over 10,000 participants')).toBeVisible();
    await expect(page.locator('text=25+ leading dermatology research')).toBeVisible();
  });

  test('should display commitment section', async ({ page }) => {
    await page.goto('/learn');
    
    // Check commitment section
    await expect(page.locator('h2:has-text("Our Research Commitment")')).toBeVisible();
    
    // Check commitment items
    await expect(page.locator('text=Scientific Rigor')).toBeVisible();
    await expect(page.locator('text=Privacy First')).toBeVisible();
    await expect(page.locator('text=Inclusive Research')).toBeVisible();
    await expect(page.locator('text=Community Focused')).toBeVisible();
  });

  test('should display get involved section', async ({ page }) => {
    await page.goto('/learn');
    
    // Check get involved section
    await expect(page.locator('h2:has-text("Join Our Research Community")')).toBeVisible();
    
    // Check CTA buttons
    await expect(page.locator('button:has-text("Join Research Community")')).toBeVisible();
    await expect(page.locator('button:has-text("Learn More About Research")')).toBeVisible();
  });

  test('should have proper accessibility features', async ({ page }) => {
    await page.goto('/learn');
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    const h2s = page.locator('h2');
    await expect(h2s).toHaveCount(5); // Should have 5 h2 headings
    
    // Check for proper landmarks
    await expect(page.locator('main[id="main"]')).toBeVisible();
    
    // Check for proper ARIA labels
    const sections = page.locator('section');
    await expect(sections).toHaveCount(6); // Should have 6 sections
  });

  test('should have interactive elements with proper focus management', async ({ page }) => {
    await page.goto('/learn');
    
    // Test CTA button focus
    const ctaButton = page.locator('button:has-text("Join Research Community")');
    await ctaButton.focus();
    await expect(ctaButton).toBeFocused();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const nextButton = page.locator('button:has-text("Learn More About Research")');
    await expect(nextButton).toBeFocused();
  });

  test('should display pull quotes with proper attribution', async ({ page }) => {
    await page.goto('/learn');
    
    // Check for pull quotes
    const blockquotes = page.locator('blockquote');
    await expect(blockquotes).toHaveCount(2); // Should have 2 pull quotes
    
    // Check first pull quote
    const firstQuote = blockquotes.first();
    await expect(firstQuote).toContainText('The diversity of melanocyte function');
    await expect(firstQuote).toContainText('Dr. Sarah Chen');
    await expect(firstQuote).toContainText('Journal of Dermatological Science, 2024');
    
    // Check second pull quote
    const secondQuote = blockquotes.nth(1);
    await expect(secondQuote).toContainText('This research represents a paradigm shift');
    await expect(secondQuote).toContainText('Dr. Maria Rodriguez');
    await expect(secondQuote).toContainText('International Journal of Dermatology, 2024');
  });

  test('should have proper semantic structure', async ({ page }) => {
    await page.goto('/learn');
    
    // Check for proper article structure
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Check for proper section structure
    const sections = page.locator('section');
    await expect(sections).toHaveCount(6);
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3');
    await expect(headings).toHaveCount(8); // 1 h1 + 5 h2 + 2 h3
  });
});
