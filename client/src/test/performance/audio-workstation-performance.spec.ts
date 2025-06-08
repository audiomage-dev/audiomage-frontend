import { test, expect } from '@playwright/test';

test.describe('Audio Workstation Performance', () => {
  test('should load main interface within performance budget', async ({
    page,
  }) => {
    const startTime = Date.now();

    await page.goto('/studio');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Check for performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance
          .getEntriesByType('paint')
          .find((p) => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: performance
          .getEntriesByType('paint')
          .find((p) => p.name === 'first-contentful-paint')?.startTime,
      };
    });

    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000);
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1500);
  });

  test('should handle multiple track operations efficiently', async ({
    page,
  }) => {
    await page.goto('/studio');
    await page.waitForLoadState('networkidle');

    const startTime = performance.now();

    // Add 10 tracks rapidly
    for (let i = 0; i < 10; i++) {
      await page.locator('[data-testid="add-track-button"]').click();
      await page.locator('[data-testid="audio-track-option"]').click();
    }

    const operationTime = performance.now() - startTime;

    // Should complete within reasonable time
    expect(operationTime).toBeLessThan(5000);

    // Verify all tracks were created
    await expect(page.locator('[data-testid^="track-"]')).toHaveCount(10);
  });

  test('should maintain 60fps during timeline scrolling', async ({ page }) => {
    await page.goto('/studio');
    await page.waitForLoadState('networkidle');

    // Add some content to make scrolling meaningful
    for (let i = 0; i < 5; i++) {
      await page.locator('[data-testid="add-track-button"]').click();
      await page.locator('[data-testid="audio-track-option"]').click();
    }

    const timeline = page.locator('[data-testid="timeline-editor"]');

    // Start performance monitoring
    await page.evaluate(() => {
      (window as any).frameCount = 0;
      (window as any).startTime = performance.now();

      function countFrames() {
        (window as any).frameCount++;
        requestAnimationFrame(countFrames);
      }
      countFrames();
    });

    // Perform scrolling operations
    await timeline.hover();
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(100, 0);
      await page.waitForTimeout(16); // ~60fps frame time
    }

    // Check frame rate
    const fps = await page.evaluate(() => {
      const endTime = performance.now();
      const duration = endTime - (window as any).startTime;
      return ((window as any).frameCount / duration) * 1000;
    });

    expect(fps).toBeGreaterThan(55); // Allow some tolerance
  });

  test('should handle large audio file processing', async ({ page }) => {
    await page.goto('/studio');
    await page.waitForLoadState('networkidle');

    // Mock file upload with large file
    await page.route('**/api/upload', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          fileId: 'large-audio-file',
          size: 50 * 1024 * 1024, // 50MB
        }),
      });
    });

    const startTime = performance.now();

    // Simulate file upload
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles(
        'attached_assets/file_example_WAV_1MG (1).wav'
      );
    }

    // Wait for processing
    await page.waitForSelector('[data-testid="audio-waveform"]', {
      timeout: 10000,
    });

    const processingTime = performance.now() - startTime;

    // Should process within reasonable time
    expect(processingTime).toBeLessThan(8000);
  });

  test('should maintain memory usage within limits', async ({ page }) => {
    await page.goto('/studio');
    await page.waitForLoadState('networkidle');

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Perform memory-intensive operations
    for (let i = 0; i < 20; i++) {
      await page.locator('[data-testid="add-track-button"]').click();
      await page.locator('[data-testid="audio-track-option"]').click();
    }

    // Force garbage collection if available
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });

  test('should handle concurrent user interactions', async ({ page }) => {
    await page.goto('/studio');
    await page.waitForLoadState('networkidle');

    const startTime = performance.now();

    // Simulate concurrent interactions
    const promises = [
      page.locator('[data-testid="play-button"]').click(),
      page.locator('[data-testid="volume-slider"]').fill('75'),
      page.locator('[data-testid="add-track-button"]').click(),
      page.keyboard.press('Space'), // Play/pause shortcut
    ];

    await Promise.all(promises);

    const interactionTime = performance.now() - startTime;

    // All interactions should complete quickly
    expect(interactionTime).toBeLessThan(1000);

    // Verify UI remains responsive
    await expect(
      page.locator('[data-testid="audio-workstation"]')
    ).toBeVisible();
  });

  test('should optimize bundle size', async ({ page }) => {
    // Navigate and capture network requests
    const responses: any[] = [];

    page.on('response', (response) => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        responses.push({
          url: response.url(),
          size: response.headers()['content-length'] || 0,
        });
      }
    });

    await page.goto('/studio');
    await page.waitForLoadState('networkidle');

    // Calculate total bundle size
    const totalBundleSize = responses.reduce((total, response) => {
      return total + parseInt(response.size as string, 10);
    }, 0);

    // Bundle should be under 5MB total
    expect(totalBundleSize).toBeLessThan(5 * 1024 * 1024);

    // Check for efficient loading
    const jsFiles = responses.filter((r) => r.url.includes('.js'));
    expect(jsFiles.length).toBeLessThan(10); // Should have reasonable chunking
  });
});
