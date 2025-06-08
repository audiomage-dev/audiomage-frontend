import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,
  testDir: './client/src/test/a11y',
  reporter: [
    ['html', { outputFolder: 'accessibility-results' }],
    ['json', { outputFile: 'accessibility-results/a11y-results.json' }],
  ],
  use: {
    ...baseConfig.use,
    // Additional accessibility testing setup
  },
  projects: [
    {
      name: 'accessibility-chromium',
      use: { 
        ...baseConfig.projects?.[0]?.use,
        // Ensure high contrast mode is tested
        colorScheme: 'light',
      },
    },
    {
      name: 'accessibility-chromium-dark',
      use: { 
        ...baseConfig.projects?.[0]?.use,
        colorScheme: 'dark',
      },
    },
  ],
});