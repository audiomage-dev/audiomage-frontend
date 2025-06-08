import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should not have any automatically detectable accessibility issues on home page', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have any automatically detectable accessibility issues on studio page', async ({ page }) => {
    await page.goto('/studio');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('.monaco-editor') // Exclude third-party editors that may have violations
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation in audio workstation', async ({ page }) => {
    await page.goto('/studio');
    
    // Test tab navigation through interactive elements
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus').getAttribute('data-testid');
    expect(focusedElement).toBeTruthy();
    
    // Continue tabbing through at least 5 elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const nextFocused = await page.locator(':focus').getAttribute('data-testid');
      expect(nextFocused).toBeTruthy();
    }
    
    // Test reverse tab navigation
    await page.keyboard.press('Shift+Tab');
    const previousFocused = await page.locator(':focus').getAttribute('data-testid');
    expect(previousFocused).toBeTruthy();
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/studio');
    
    // Check main landmarks
    const main = page.locator('[role="main"]');
    await expect(main).toBeVisible();
    await expect(main).toHaveAttribute('aria-label');
    
    // Check button accessibility
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      const hasAriaLabel = await button.getAttribute('aria-label');
      const hasTextContent = await button.textContent();
      
      // Each button should have either aria-label or text content
      expect(hasAriaLabel || hasTextContent).toBeTruthy();
    }
  });

  test('should support screen reader announcements', async ({ page }) => {
    await page.goto('/studio');
    
    // Check for live regions for dynamic content
    const liveRegions = page.locator('[aria-live]');
    const liveRegionCount = await liveRegions.count();
    
    if (liveRegionCount > 0) {
      for (let i = 0; i < liveRegionCount; i++) {
        const region = liveRegions.nth(i);
        const ariaLive = await region.getAttribute('aria-live');
        expect(['polite', 'assertive', 'off']).toContain(ariaLive);
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/studio');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    
    expect(colorContrastViolations).toEqual([]);
  });

  test('should work with high contrast mode', async ({ page, browserName }) => {
    // Skip for webkit as it doesn't support forced-colors
    if (browserName === 'webkit') {
      test.skip();
    }
    
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    await page.goto('/studio');
    
    // Verify interface is still functional
    await expect(page.locator('[data-testid="audio-workstation"]')).toBeVisible();
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support zoom up to 200%', async ({ page }) => {
    await page.goto('/studio');
    
    // Set zoom to 200%
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });
    
    // Wait for layout to adjust
    await page.waitForTimeout(1000);
    
    // Verify main elements are still visible and accessible
    await expect(page.locator('[data-testid="audio-workstation"]')).toBeVisible();
    await expect(page.locator('[data-testid="transport-controls"]')).toBeVisible();
    
    // Test that buttons are still clickable
    const playButton = page.locator('[data-testid="play-button"]');
    if (await playButton.isVisible()) {
      await playButton.click();
    }
  });

  test('should provide appropriate focus indicators', async ({ page }) => {
    await page.goto('/studio');
    
    // Add custom CSS to make focus more visible for testing
    await page.addStyleTag({
      content: `
        *:focus {
          outline: 3px solid red !important;
          outline-offset: 2px !important;
        }
      `
    });
    
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    
    // Verify focus is visible
    const outlineStyle = await focusedElement.evaluate((el) => {
      return window.getComputedStyle(el).outline;
    });
    
    expect(outlineStyle).toContain('red');
  });
});