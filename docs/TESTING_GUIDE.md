# Audiomage Testing Guide

## Overview

This guide covers the comprehensive testing strategy for the Audiomage AI-powered audio workstation, including unit tests, integration tests, end-to-end tests, and accessibility testing.

## Testing Architecture

### Test Layers

1. **Unit Tests** - Individual component and function testing
2. **Integration Tests** - Component interaction and API testing
3. **End-to-End Tests** - Complete user workflow testing
4. **Performance Tests** - Load time and responsiveness testing
5. **Accessibility Tests** - WCAG compliance and screen reader testing
6. **Visual Regression Tests** - UI consistency testing

## Setup and Installation

### Prerequisites

```bash
npm install  # Installs all testing dependencies
npx playwright install --with-deps  # Install browser binaries
```

### Configuration Files

- `vitest.config.ts` - Unit test configuration
- `playwright.config.ts` - E2E test configuration
- `playwright-a11y.config.ts` - Accessibility test configuration
- `playwright-performance.config.ts` - Performance test configuration

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Run specific test file
npx vitest run client/src/test/unit/hooks/useAudioWorkstation.test.ts
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run specific integration test
npx vitest run client/src/test/integration/audio-processing.test.ts
```

### End-to-End Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run smoke tests only
npm run test:e2e:smoke

# Run tests in specific browser
npx playwright test --project=chromium

# Run with UI mode
npx playwright test --ui
```

### Accessibility Tests

```bash
# Run accessibility tests
npm run test:a11y

# Run with specific configuration
npx playwright test --config playwright-a11y.config.ts
```

### Performance Tests

```bash
# Run performance tests
npm run test:performance

# Run specific performance test
npx playwright test --config playwright-performance.config.ts
```

## Writing Tests

### Unit Test Example

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAudioWorkstation } from '../../../hooks/useAudioWorkstation';

describe('useAudioWorkstation', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAudioWorkstation());
    
    expect(result.current.transport.isPlaying).toBe(false);
    expect(result.current.transport.isStopped).toBe(true);
  });
});
```

### Component Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AudioWorkstation } from '../../components/AudioWorkstation';

describe('AudioWorkstation', () => {
  it('renders transport controls', () => {
    render(<AudioWorkstation />);
    
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should load audio workstation @smoke', async ({ page }) => {
  await page.goto('/studio');
  
  await expect(page.locator('[data-testid="audio-workstation"]')).toBeVisible();
  await expect(page.locator('[data-testid="transport-controls"]')).toBeVisible();
});
```

## Test Data Management

### Audio Files for Testing

Place test audio files in `client/src/test/fixtures/`:
- `test-audio-short.wav` - 5 second test file
- `test-audio-long.wav` - 30 second test file
- `test-midi.mid` - MIDI test file

### Mock Data

Use consistent mock data across tests:

```typescript
const mockProject = {
  id: 'test-project-1',
  name: 'Test Project',
  bpm: 120,
  timeSignature: [4, 4] as [number, number],
  tracks: [],
};

const mockTrack = {
  id: 'test-track-1',
  name: 'Test Track',
  type: 'audio' as const,
  volume: 75,
  muted: false,
  solo: false,
};
```

## Mocking Strategies

### Web Audio API Mocking

```typescript
// In test setup
global.AudioContext = vi.fn().mockImplementation(() => ({
  createGain: vi.fn().mockReturnValue({
    gain: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
  destination: {},
  sampleRate: 48000,
  currentTime: 0,
}));
```

### API Mocking

```typescript
// Mock fetch for API calls
global.fetch = vi.fn().mockImplementation((url) => {
  if (url.includes('/api/projects')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ projects: [mockProject] }),
    });
  }
  return Promise.resolve({ ok: false });
});
```

## Coverage Requirements

### Minimum Coverage Thresholds

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

### Coverage Reports

```bash
# Generate HTML coverage report
npm run test:coverage

# View coverage report
open coverage/index.html
```

## Test Organization

### Directory Structure

```
client/src/test/
├── setup.ts                 # Test setup and global mocks
├── unit/                    # Unit tests
│   ├── components/          # Component unit tests
│   ├── hooks/              # Hook unit tests
│   └── utils/              # Utility function tests
├── integration/            # Integration tests
├── e2e/                   # End-to-end tests
├── a11y/                  # Accessibility tests
├── performance/           # Performance tests
└── fixtures/              # Test data and assets
```

## Debugging Tests

### Debug Unit Tests

```bash
# Run with debug output
npx vitest run --reporter=verbose

# Debug specific test
npx vitest run --reporter=verbose path/to/test.ts
```

### Debug E2E Tests

```bash
# Run with headed browser
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Trace viewer
npx playwright show-trace trace.zip
```

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Pull requests
- Pushes to main/develop branches
- Release tags

### Test Reports

- HTML reports uploaded as artifacts
- Coverage reports sent to Codecov
- Performance metrics tracked over time

## Best Practices

### Unit Tests

1. Test one thing at a time
2. Use descriptive test names
3. Arrange, Act, Assert pattern
4. Mock external dependencies
5. Test both success and error cases

### E2E Tests

1. Use data-testid attributes for selectors
2. Wait for network requests to complete
3. Test critical user paths only
4. Keep tests independent
5. Use Page Object Model for complex flows

### Performance Tests

1. Set realistic performance budgets
2. Test on different devices/networks
3. Monitor key metrics over time
4. Test memory usage and leaks
5. Validate bundle size limits

### Accessibility Tests

1. Test with keyboard navigation
2. Verify screen reader compatibility
3. Check color contrast ratios
4. Test with zoom up to 200%
5. Validate ARIA attributes

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout in config
2. **Flaky tests**: Add proper waits and assertions
3. **Mock not working**: Check mock setup in beforeEach
4. **Browser not launching**: Run `npx playwright install`
5. **Coverage too low**: Add tests for uncovered code

### Getting Help

1. Check test logs and error messages
2. Use debugger statements in tests
3. Run tests in isolation to identify issues
4. Check CI logs for environment-specific problems
5. Consult team documentation and standards