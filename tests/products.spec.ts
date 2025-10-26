import { test, expect } from '@playwright/test';

test.describe('Product Pages Tests', () => {
  test('should display Face Elixir product page correctly', async ({ page }) => {
    await page.goto('/products/face-elixir');
    
    // Check page title and hero section
    await expect(page.locator('h1')).toContainText('Face Elixir');
    await expect(page.locator('text=THD Ascorbate + Bakuchiol + Peptides')).toBeVisible();
    
    // Check price is displayed
    await expect(page.locator('text=$89')).toBeVisible();
    
    // Check key benefits are shown
    await expect(page.locator('text=Brightening & Even Tone')).toBeVisible();
    await expect(page.locator('text=Anti-Aging & Firmness')).toBeVisible();
    await expect(page.locator('text=Barrier Support')).toBeVisible();
  });

  test('should display Body Elixir product page correctly', async ({ page }) => {
    await page.goto('/products/body-elixir');
    
    // Check page title and hero section
    await expect(page.locator('h1')).toContainText('Body Elixir');
    await expect(page.locator('text=Ceramide Complex + Botanical Oils')).toBeVisible();
    
    // Check price is displayed
    await expect(page.locator('text=$79')).toBeVisible();
    
    // Check key benefits are shown
    await expect(page.locator('text=Barrier Repair & Protection')).toBeVisible();
    await expect(page.locator('text=Deep Hydration & Nourishment')).toBeVisible();
    await expect(page.locator('text=Anti-Inflammatory & Soothing')).toBeVisible();
  });

  test('should display ingredient list with proper accessibility', async ({ page }) => {
    await page.goto('/products/face-elixir');
    
    // Check ingredient list section
    await expect(page.locator('h2:has-text("Complete Ingredient List")')).toBeVisible();
    
    // Check ingredients are displayed
    await expect(page.locator('text=THD Ascorbate')).toBeVisible();
    await expect(page.locator('text=Bakuchiol')).toBeVisible();
    await expect(page.locator('text=Copper Peptide')).toBeVisible();
    
    // Check safety information
    await expect(page.locator('text=Ingredient Safety & Transparency')).toBeVisible();
  });

  test('should display benefits table with clinical evidence', async ({ page }) => {
    await page.goto('/products/face-elixir');
    
    // Check benefits section
    await expect(page.locator('h2:has-text("Clinical Benefits & Results")')).toBeVisible();
    
    // Check benefits are displayed
    await expect(page.locator('text=Brightening & Even Tone')).toBeVisible();
    await expect(page.locator('text=Anti-Aging & Firmness')).toBeVisible();
    
    // Check clinical evidence toggle
    const clinicalToggle = page.locator('button:has-text("Show Clinical Evidence")');
    await expect(clinicalToggle).toBeVisible();
    
    // Click to show clinical evidence
    await clinicalToggle.click();
    await expect(page.locator('text=Clinical Evidence')).toBeVisible();
  });

  test('should display usage guide with step-by-step instructions', async ({ page }) => {
    await page.goto('/products/face-elixir');
    
    // Check usage guide section
    await expect(page.locator('h2:has-text("How to Use Face Elixir")')).toBeVisible();
    
    // Check usage steps
    await expect(page.locator('text=Step 1: Cleanse')).toBeVisible();
    await expect(page.locator('text=Step 2: Wait')).toBeVisible();
    await expect(page.locator('text=Step 3: Apply')).toBeVisible();
    await expect(page.locator('text=Step 4: Protect')).toBeVisible();
    
    // Check pro tips and warnings
    await expect(page.locator('text=Pro Tips')).toBeVisible();
    await expect(page.locator('text=Important Notes')).toBeVisible();
  });

  test('should display FAQ with search functionality', async ({ page }) => {
    await page.goto('/products/face-elixir');
    
    // Check FAQ section
    await expect(page.locator('h2:has-text("Frequently Asked Questions")')).toBeVisible();
    
    // Check search functionality
    const searchInput = page.locator('input[placeholder="Search FAQs..."]');
    await expect(searchInput).toBeVisible();
    
    // Test search
    await searchInput.fill('sensitive skin');
    await expect(page.locator('text=Is this safe for sensitive skin?')).toBeVisible();
    
    // Clear search
    await page.click('button:has-text("Clear Search")');
    await expect(searchInput).toHaveValue('');
  });

  test('should have accessible product interactions', async ({ page }) => {
    await page.goto('/products/face-elixir');
    
    // Test add to cart button
    const addToCartButton = page.locator('button:has-text("Add to Cart")');
    await expect(addToCartButton).toBeVisible();
    await expect(addToCartButton).toBeEnabled();
    
    // Test wishlist button
    const wishlistButton = page.locator('button[aria-label*="wishlist"], button:has-text("Heart")');
    await expect(wishlistButton).toBeVisible();
    
    // Test share button
    const shareButton = page.locator('button[aria-label*="share"], button:has-text("Share")');
    await expect(shareButton).toBeVisible();
  });

  test('should have proper keyboard navigation for FAQ', async ({ page }) => {
    await page.goto('/products/face-elixir');
    
    // Navigate to FAQ section
    const faqSection = page.locator('h2:has-text("Frequently Asked Questions")');
    await faqSection.scrollIntoViewIfNeeded();
    
    // Test keyboard navigation for FAQ items
    const firstFAQ = page.locator('[role="button"][aria-expanded="false"]').first();
    await firstFAQ.focus();
    await expect(firstFAQ).toBeFocused();
    
    // Test Enter key to expand FAQ
    await page.keyboard.press('Enter');
    await expect(firstFAQ).toHaveAttribute('aria-expanded', 'true');
    
    // Test Escape key to close FAQ
    await page.keyboard.press('Escape');
    await expect(firstFAQ).toHaveAttribute('aria-expanded', 'false');
  });

  test('should display product specifications correctly', async ({ page }) => {
    await page.goto('/products/face-elixir');
    
    // Check specifications are displayed
    await expect(page.locator('text=Volume:')).toBeVisible();
    await expect(page.locator('text=30ml / 1 fl oz')).toBeVisible();
    
    await expect(page.locator('text=Texture:')).toBeVisible();
    await expect(page.locator('text=Lightweight serum, fast-absorbing')).toBeVisible();
    
    await expect(page.locator('text=Scent:')).toBeVisible();
    await expect(page.locator('text=Unscented')).toBeVisible();
    
    await expect(page.locator('text=Shelf Life:')).toBeVisible();
    await expect(page.locator('text=24 months unopened, 6 months after opening')).toBeVisible();
  });
});
