import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,
  testDir: './client/src/test/performance',
  timeout: 60000, // Performance tests may take longer
  reporter: [
    ['html', { outputFolder: 'performance-results' }],
    ['json', { outputFile: 'performance-results/performance-results.json' }],
  ],
  use: {
    ...baseConfig.use,
    // Performance testing specific settings
    video: 'on',
    trace: 'on',
  },
  projects: [
    {
      name: 'performance-desktop',
      use: {
        ...baseConfig.projects?.[0]?.use,
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'performance-mobile',
      use: {
        ...baseConfig.projects?.[4]?.use, // Mobile Chrome config
      },
    },
  ],
});
