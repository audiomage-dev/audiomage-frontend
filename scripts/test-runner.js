#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const tests = {
  unit: {
    name: 'Unit Tests',
    command: 'npx',
    args: ['vitest', 'run', '--coverage'],
    description: 'Run unit tests with coverage reporting',
  },
  components: {
    name: 'Component Tests',
    command: 'npx',
    args: ['vitest', 'run', 'client/src/test/components'],
    description: 'Run React component tests',
  },
  integration: {
    name: 'Integration Tests',
    command: 'npx',
    args: ['vitest', 'run', 'client/src/test/integration'],
    description: 'Run integration tests for audio processing',
  },
  e2e: {
    name: 'End-to-End Tests',
    command: 'npx',
    args: ['playwright', 'test'],
    description: 'Run E2E tests with Playwright',
  },
  'e2e-smoke': {
    name: 'Smoke Tests',
    command: 'npx',
    args: ['playwright', 'test', '--grep', '@smoke'],
    description: 'Run critical smoke tests only',
  },
  accessibility: {
    name: 'Accessibility Tests',
    command: 'npx',
    args: ['playwright', 'test', '--config', 'playwright-a11y.config.ts'],
    description: 'Run WCAG compliance tests',
  },
  performance: {
    name: 'Performance Tests',
    command: 'npx',
    args: [
      'playwright',
      'test',
      '--config',
      'playwright-performance.config.ts',
    ],
    description: 'Run performance and bundle size tests',
  },
  lint: {
    name: 'Code Quality',
    command: 'npx',
    args: ['eslint', '.', '--ext', '.ts,.tsx'],
    description: 'Run ESLint code quality checks',
  },
  format: {
    name: 'Format Check',
    command: 'npx',
    args: ['prettier', '--check', '.'],
    description: 'Check code formatting with Prettier',
  },
  security: {
    name: 'Security Audit',
    command: 'npm',
    args: ['audit', '--audit-level', 'moderate'],
    description: 'Run npm security audit',
  },
};

function runTest(testType) {
  const test = tests[testType];
  if (!test) {
    console.error(`Unknown test type: ${testType}`);
    console.error(`Available tests: ${Object.keys(tests).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n🧪 Running ${test.name}`);
  console.log(`📝 ${test.description}\n`);

  const child = spawn(test.command, test.args, {
    stdio: 'inherit',
    shell: true,
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log(`\n✅ ${test.name} completed successfully`);
    } else {
      console.log(`\n❌ ${test.name} failed with exit code ${code}`);
      process.exit(code);
    }
  });

  child.on('error', (error) => {
    console.error(`Error running ${test.name}:`, error);
    process.exit(1);
  });
}

function runAllTests() {
  console.log('🚀 Running comprehensive test suite for Audiomage');

  const testSequence = ['lint', 'format', 'unit', 'integration', 'e2e-smoke'];
  let currentIndex = 0;

  function runNext() {
    if (currentIndex >= testSequence.length) {
      console.log('\n🎉 All tests completed successfully!');
      return;
    }

    const testType = testSequence[currentIndex];
    const test = tests[testType];

    console.log(
      `\n[${currentIndex + 1}/${testSequence.length}] Running ${test.name}`
    );

    const child = spawn(test.command, test.args, {
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${test.name} passed`);
        currentIndex++;
        runNext();
      } else {
        console.log(`❌ ${test.name} failed with exit code ${code}`);
        process.exit(code);
      }
    });

    child.on('error', (error) => {
      console.error(`Error running ${test.name}:`, error);
      process.exit(1);
    });
  }

  runNext();
}

function showHelp() {
  console.log('🎵 Audiomage Test Runner');
  console.log('\nUsage: node scripts/test-runner.js <test-type>');
  console.log('\nAvailable test types:');

  Object.entries(tests).forEach(([key, test]) => {
    console.log(`  ${key.padEnd(15)} - ${test.description}`);
  });

  console.log('\nSpecial commands:');
  console.log('  all              - Run full test suite');
  console.log('  help             - Show this help message');
}

const testType = process.argv[2];

if (!testType || testType === 'help') {
  showHelp();
} else if (testType === 'all') {
  runAllTests();
} else {
  runTest(testType);
}
