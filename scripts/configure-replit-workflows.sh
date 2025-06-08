#!/bin/bash

# Configure Replit Agent Workflows for Audiomage CI/CD Pipeline
# This script sets up executable workflows that appear in the Replit interface

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Color codes
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Configuring Replit Agent Workflows for Audiomage${NC}"
echo "================================================="

# Create workflow wrapper scripts
create_workflow_script() {
    local name="$1"
    local command="$2"
    local description="$3"
    
    cat > "$PROJECT_ROOT/workflow-$name.sh" << EOF
#!/bin/bash
# Replit Workflow: $description
cd "\$(dirname "\$0")"
echo "🎵 Audiomage: $description"
echo "Command: $command"
echo ""
$command
EOF
    chmod +x "$PROJECT_ROOT/workflow-$name.sh"
    echo -e "${GREEN}Created workflow: workflow-$name.sh${NC}"
}

# Create individual workflow scripts
create_workflow_script "test" "npx vitest run" "Run unit tests"
create_workflow_script "test-watch" "npx vitest" "Run tests in watch mode"
create_workflow_script "test-coverage" "npx vitest run --coverage" "Run tests with coverage"
create_workflow_script "lint" "npx eslint . --ext .ts,.tsx --fix" "Lint and fix code"
create_workflow_script "format" "npx prettier --write ." "Format code"
create_workflow_script "typecheck" "npx tsc --noEmit" "TypeScript type checking"
create_workflow_script "build" "npm run build" "Build production bundle"
create_workflow_script "audit" "npm audit --audit-level=moderate" "Security audit"
create_workflow_script "dev-test" "./scripts/replit-workflows.sh dev-test" "Development with live testing"
create_workflow_script "deploy-check" "node scripts/replit-runner.js deploy-check" "Pre-deployment validation"

echo ""
echo -e "${YELLOW}Available Replit Workflows:${NC}"
echo "• workflow-test.sh - Unit testing"
echo "• workflow-test-watch.sh - Live testing"
echo "• workflow-test-coverage.sh - Coverage reporting"
echo "• workflow-lint.sh - Code quality"
echo "• workflow-format.sh - Code formatting"
echo "• workflow-typecheck.sh - Type validation"
echo "• workflow-build.sh - Production build"
echo "• workflow-audit.sh - Security scanning"
echo "• workflow-dev-test.sh - Development + testing"
echo "• workflow-deploy-check.sh - Deployment validation"

echo ""
echo -e "${GREEN}Replit workflows configured successfully!${NC}"
echo "You can now run workflows from the Replit interface or command line."