import { test, expect } from '@playwright/test';

test.describe('Audio Workstation - Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/studio');
    await page.waitForLoadState('networkidle');
  });

  test('should load the main workstation interface @smoke', async ({
    page,
  }) => {
    // Check main interface elements
    await expect(
      page.locator('[data-testid="audio-workstation"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="transport-controls"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="timeline-editor"]')).toBeVisible();

    // Verify menu bar is present
    await expect(page.locator('[data-testid="menu-bar"]')).toBeVisible();

    // Check initial project state
    await expect(page.locator('text=Film_Mix_v3.amp')).toBeVisible();
  });

  test('should handle transport controls @smoke', async ({ page }) => {
    const playButton = page.locator('[data-testid="play-button"]');
    const pauseButton = page.locator('[data-testid="pause-button"]');
    const stopButton = page.locator('[data-testid="stop-button"]');

    // Test play functionality
    await playButton.click();
    await expect(playButton).toHaveAttribute('aria-pressed', 'true');

    // Test pause functionality
    await pauseButton.click();
    await expect(pauseButton).toHaveAttribute('aria-pressed', 'true');

    // Test stop functionality
    await stopButton.click();
    await expect(stopButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should switch between editor views', async ({ page }) => {
    // Start with timeline view
    await expect(page.locator('[data-testid="timeline-editor"]')).toBeVisible();

    // Switch to MIDI view
    await page.locator('[data-testid="midi-view-button"]').click();
    await expect(page.locator('[data-testid="midi-editor"]')).toBeVisible();

    // Switch to score view
    await page.locator('[data-testid="score-view-button"]').click();
    await expect(page.locator('[data-testid="score-editor"]')).toBeVisible();

    // Switch back to timeline
    await page.locator('[data-testid="timeline-view-button"]').click();
    await expect(page.locator('[data-testid="timeline-editor"]')).toBeVisible();
  });

  test('should handle track operations', async ({ page }) => {
    // Add a new track
    await page.locator('[data-testid="add-track-button"]').click();
    await page.locator('[data-testid="audio-track-option"]').click();

    // Verify track was added
    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(1);

    // Test track mute
    const muteButton = page
      .locator('[data-testid="track-mute-button"]')
      .first();
    await muteButton.click();
    await expect(muteButton).toHaveAttribute('aria-pressed', 'true');

    // Test track solo
    const soloButton = page
      .locator('[data-testid="track-solo-button"]')
      .first();
    await soloButton.click();
    await expect(soloButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should handle project operations @smoke', async ({ page }) => {
    // Test project save
    await page.keyboard.press('Control+S');
    await expect(page.locator('text=Project saved')).toBeVisible();

    // Test project settings
    await page.locator('[data-testid="project-settings-button"]').click();
    await expect(
      page.locator('[data-testid="project-settings-modal"]')
    ).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
    await expect(
      page.locator('[data-testid="project-settings-modal"]')
    ).not.toBeVisible();
  });

  test('should handle AI tools integration', async ({ page }) => {
    // Open AI tools
    await page.locator('[data-testid="ai-tools-button"]').click();
    await expect(page.locator('[data-testid="ai-tools-modal"]')).toBeVisible();

    // Test AI suggestion acceptance
    const suggestion = page.locator('[data-testid="ai-suggestion"]').first();
    if (await suggestion.isVisible()) {
      await suggestion.locator('[data-testid="accept-suggestion"]').click();
      await expect(page.locator('text=Applied AI suggestion')).toBeVisible();
    }
  });

  test('should be accessible', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Test screen reader compatibility
    const mainContent = page.locator('[role="main"]');
    await expect(mainContent).toHaveAttribute('aria-label');

    // Test color contrast (basic check)
    const computedStyle = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el);
    });
    expect(computedStyle.color).toBeTruthy();
    expect(computedStyle.backgroundColor).toBeTruthy();
  });

  test('should handle responsive layout', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(
      page.locator('[data-testid="mobile-menu-button"]')
    ).toBeVisible();

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(
      page.locator('[data-testid="compact-controls"]')
    ).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/**', (route) => route.abort());

    // Try to perform an action that requires network
    await page.locator('[data-testid="save-project-button"]').click();

    // Check error handling
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=Unable to save project')).toBeVisible();
  });

  test('should maintain state during navigation', async ({ page }) => {
    // Set some state
    await page.locator('[data-testid="play-button"]').click();
    await page.locator('[data-testid="volume-slider"]').fill('75');

    // Navigate away and back
    await page.goto('/');
    await page.goto('/studio');

    // Verify state persistence (if implemented)
    await expect(page.locator('[data-testid="volume-slider"]')).toHaveValue(
      '75'
    );
  });
});
