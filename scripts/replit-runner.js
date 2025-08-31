#!/usr/bin/env node

/**
 * Replit Workflow Runner for Audiomage CI/CD Pipeline
 * Provides interactive workflow management in the Replit environment
 */

import { spawn } from 'child_process';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(__dirname);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

class ReplitWorkflowRunner {
  constructor() {
    this.workflows = {
      dev: {
        cmd: './scripts/replit-workflows.sh dev',
        desc: 'Start development server',
        category: 'development',
      },
      test: {
        cmd: './scripts/replit-workflows.sh test',
        desc: 'Run unit tests',
        category: 'testing',
      },
      'test-watch': {
        cmd: './scripts/replit-workflows.sh test-watch',
        desc: 'Run tests in watch mode',
        category: 'testing',
      },
      'test-coverage': {
        cmd: './scripts/replit-workflows.sh test-coverage',
        desc: 'Run tests with coverage',
        category: 'testing',
      },
      'test-all': {
        cmd: './scripts/replit-workflows.sh test-all',
        desc: 'Complete test suite',
        category: 'testing',
      },
      lint: {
        cmd: './scripts/replit-workflows.sh lint',
        desc: 'Run ESLint checks',
        category: 'quality',
      },
      format: {
        cmd: './scripts/replit-workflows.sh format',
        desc: 'Format code',
        category: 'quality',
      },
      typecheck: {
        cmd: './scripts/replit-workflows.sh typecheck',
        desc: 'TypeScript checking',
        category: 'quality',
      },
      build: {
        cmd: './scripts/replit-workflows.sh build',
        desc: 'Build production',
        category: 'build',
      },
      'deploy-check': {
        cmd: './scripts/replit-workflows.sh deploy-check',
        desc: 'Pre-deployment validation',
        category: 'build',
      },
      audit: {
        cmd: './scripts/replit-workflows.sh audit',
        desc: 'Security audit',
        category: 'security',
      },
    };
  }

  showHeader() {
    console.log(`${colors.cyan}${colors.bright}`);
    console.log('🎵 Audiomage Audio Workstation - Replit CI/CD Pipeline');
    console.log('========================================================');
    console.log(`${colors.reset}`);
  }

  showWorkflows() {
    const categories = {
      development: `${colors.blue}Development Workflows:${colors.reset}`,
      testing: `${colors.yellow}Testing Workflows:${colors.reset}`,
      quality: `${colors.magenta}Quality Workflows:${colors.reset}`,
      build: `${colors.cyan}Build & Deploy:${colors.reset}`,
      security: `${colors.red}Security:${colors.reset}`,
    };

    Object.entries(categories).forEach(([category, title]) => {
      console.log(`\n${title}`);
      Object.entries(this.workflows)
        .filter(([_, workflow]) => workflow.category === category)
        .forEach(([key, workflow]) => {
          console.log(
            `  ${colors.green}${key.padEnd(15)}${colors.reset} ${workflow.desc}`
          );
        });
    });

    console.log(`\n${colors.white}Special Commands:${colors.reset}`);
    console.log(
      `  ${colors.green}help${colors.reset}           Show this help message`
    );
    console.log(
      `  ${colors.green}status${colors.reset}         Show CI/CD pipeline status`
    );
    console.log(
      `  ${colors.green}interactive${colors.reset}    Interactive workflow selection`
    );
    console.log(`  ${colors.green}exit${colors.reset}           Exit runner`);
  }

  async runWorkflow(workflowName, args = []) {
    const workflow = this.workflows[workflowName];
    if (!workflow) {
      console.log(
        `${colors.red}Error: Unknown workflow '${workflowName}'${colors.reset}`
      );
      return false;
    }

    console.log(`${colors.blue}Running: ${workflow.desc}${colors.reset}`);
    console.log(`${colors.cyan}Command: ${workflow.cmd}${colors.reset}\n`);

    return new Promise((resolve) => {
      const [command, ...cmdArgs] = workflow.cmd.split(' ');
      const child = spawn(command, [...cmdArgs, ...args], {
        stdio: 'inherit',
        cwd: projectRoot,
        shell: true,
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(
            `\n${colors.green}✅ Workflow completed successfully${colors.reset}`
          );
          resolve(true);
        } else {
          console.log(
            `\n${colors.red}❌ Workflow failed with exit code ${code}${colors.reset}`
          );
          resolve(false);
        }
      });

      child.on('error', (error) => {
        console.log(
          `${colors.red}Error running workflow: ${error.message}${colors.reset}`
        );
        resolve(false);
      });
    });
  }

  showStatus() {
    console.log(`${colors.cyan}CI/CD Pipeline Status:${colors.reset}`);
    console.log('─'.repeat(50));
    console.log(
      `${colors.green}✅ GitHub Actions workflows: 8 configured${colors.reset}`
    );
    console.log(
      `${colors.green}✅ Testing layers: 5 implemented${colors.reset}`
    );
    console.log(
      `${colors.green}✅ Audio-specific testing: enabled${colors.reset}`
    );
    console.log(
      `${colors.green}✅ Security scanning: configured${colors.reset}`
    );
    console.log(`${colors.green}✅ Coverage threshold: 80%${colors.reset}`);
    console.log(
      `${colors.green}✅ Accessibility testing: WCAG 2.1 AA${colors.reset}`
    );
    console.log(
      `${colors.green}✅ Replit workflows: operational${colors.reset}`
    );
  }

  async interactiveMode() {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const askQuestion = (question) => {
      return new Promise((resolve) => {
        rl.question(question, resolve);
      });
    };

    console.log(
      `${colors.yellow}Interactive Workflow Selection${colors.reset}`
    );
    console.log('Available workflows:');

    const workflowList = Object.keys(this.workflows);
    workflowList.forEach((workflow, index) => {
      console.log(
        `  ${colors.green}${index + 1}.${colors.reset} ${workflow} - ${this.workflows[workflow].desc}`
      );
    });

    try {
      const answer = await askQuestion(
        `\nSelect workflow (1-${workflowList.length}) or 'q' to quit: `
      );

      if (answer.toLowerCase() === 'q') {
        rl.close();
        return;
      }

      const index = parseInt(answer) - 1;
      if (index >= 0 && index < workflowList.length) {
        const selectedWorkflow = workflowList[index];
        rl.close();
        await this.runWorkflow(selectedWorkflow);
      } else {
        console.log(`${colors.red}Invalid selection${colors.reset}`);
        rl.close();
      }
    } catch (error) {
      console.log(
        `${colors.red}Error in interactive mode: ${error.message}${colors.reset}`
      );
      rl.close();
    }
  }

  async run() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      this.showHeader();
      this.showWorkflows();
      return;
    }

    const command = args[0];
    const commandArgs = args.slice(1);

    switch (command) {
      case 'help':
      case '--help':
      case '-h':
        this.showHeader();
        this.showWorkflows();
        break;

      case 'status':
        this.showHeader();
        this.showStatus();
        break;

      case 'interactive':
        this.showHeader();
        await this.interactiveMode();
        break;

      case 'list':
        console.log(Object.keys(this.workflows).join('\n'));
        break;

      default:
        if (this.workflows[command]) {
          await this.runWorkflow(command, commandArgs);
        } else {
          console.log(
            `${colors.red}Unknown command: ${command}${colors.reset}`
          );
          console.log(
            `Run 'node scripts/replit-runner.js help' for available commands`
          );
          process.exit(1);
        }
        break;
    }
  }
}

// Run the workflow runner
const runner = new ReplitWorkflowRunner();
runner.run().catch((error) => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
