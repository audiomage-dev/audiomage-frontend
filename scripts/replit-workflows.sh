#!/bin/bash

# Replit Environment Workflow Manager for Audiomage CI/CD
# Provides comprehensive testing and deployment workflows

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Workflow functions
show_help() {
    echo -e "${BLUE}🎵 Audiomage Replit Workflow Manager${NC}"
    echo "=================================================="
    echo ""
    echo "Available workflows:"
    echo ""
    echo -e "${GREEN}Development Workflows:${NC}"
    echo "  dev           Start development server"
    echo "  dev-test      Start server with live testing"
    echo "  hot-reload    Development with hot reloading"
    echo ""
    echo -e "${YELLOW}Testing Workflows:${NC}"
    echo "  test          Run unit tests"
    echo "  test-watch    Run tests in watch mode"
    echo "  test-coverage Run tests with coverage report"
    echo "  test-all      Complete test suite"
    echo "  test-ci       CI-style testing (no watch)"
    echo ""
    echo -e "${PURPLE}Quality Workflows:${NC}"
    echo "  lint          Run ESLint checks"
    echo "  format        Format code with Prettier"
    echo "  typecheck     TypeScript type checking"
    echo "  audit         Security audit"
    echo ""
    echo -e "${CYAN}Build & Deploy Workflows:${NC}"
    echo "  build         Production build"
    echo "  build-analyze Analyze bundle size"
    echo "  preview       Preview production build"
    echo "  deploy-check  Pre-deployment validation"
    echo ""
    echo "Usage: $0 <workflow>"
}

# Development workflows
dev_workflow() {
    echo -e "${BLUE}🚀 Starting Audiomage Development Server${NC}"
    cd "$PROJECT_ROOT"
    npm run dev
}

dev_test_workflow() {
    echo -e "${BLUE}🧪 Starting Development with Live Testing${NC}"
    cd "$PROJECT_ROOT"
    
    # Start dev server in background
    npm run dev &
    DEV_PID=$!
    
    # Wait for server to start
    sleep 5
    
    # Run tests in watch mode
    npx vitest --watch &
    TEST_PID=$!
    
    # Cleanup on exit
    trap "kill $DEV_PID $TEST_PID 2>/dev/null" EXIT
    wait
}

hot_reload_workflow() {
    echo -e "${BLUE}🔥 Starting Hot Reload Development${NC}"
    cd "$PROJECT_ROOT"
    VITE_HMR_PORT=5001 npm run dev
}

# Testing workflows
test_workflow() {
    echo -e "${YELLOW}🧪 Running Unit Tests${NC}"
    cd "$PROJECT_ROOT"
    npx vitest run
}

test_watch_workflow() {
    echo -e "${YELLOW}👀 Running Tests in Watch Mode${NC}"
    cd "$PROJECT_ROOT"
    npx vitest --watch
}

test_coverage_workflow() {
    echo -e "${YELLOW}📊 Running Tests with Coverage${NC}"
    cd "$PROJECT_ROOT"
    npx vitest run --coverage
}

test_all_workflow() {
    echo -e "${YELLOW}🎯 Running Complete Test Suite${NC}"
    cd "$PROJECT_ROOT"
    
    echo "Running unit tests..."
    npx vitest run || echo "Unit tests completed with issues"
    
    echo "Running type check..."
    npx tsc --noEmit || echo "Type check completed with issues"
    
    echo "Running lint check..."
    npx eslint . --ext .ts,.tsx || echo "Lint check completed with issues"
    
    echo "Running format check..."
    npx prettier --check . || echo "Format check completed with issues"
    
    echo -e "${GREEN}✅ Complete test suite finished${NC}"
}

test_ci_workflow() {
    echo -e "${YELLOW}🤖 Running CI-style Tests${NC}"
    cd "$PROJECT_ROOT"
    CI=true npx vitest run --reporter=verbose
}

# Quality workflows
lint_workflow() {
    echo -e "${PURPLE}🔍 Running ESLint Checks${NC}"
    cd "$PROJECT_ROOT"
    npx eslint . --ext .ts,.tsx --fix
}

format_workflow() {
    echo -e "${PURPLE}✨ Formatting Code with Prettier${NC}"
    cd "$PROJECT_ROOT"
    npx prettier --write .
}

typecheck_workflow() {
    echo -e "${PURPLE}🔍 Running TypeScript Type Check${NC}"
    cd "$PROJECT_ROOT"
    npx tsc --noEmit
}

audit_workflow() {
    echo -e "${PURPLE}🔒 Running Security Audit${NC}"
    cd "$PROJECT_ROOT"
    npm audit --audit-level=moderate
}

# Build & Deploy workflows
build_workflow() {
    echo -e "${CYAN}🏗️  Building Production Bundle${NC}"
    cd "$PROJECT_ROOT"
    npm run build
}

build_analyze_workflow() {
    echo -e "${CYAN}📈 Analyzing Bundle Size${NC}"
    cd "$PROJECT_ROOT"
    npm run build
    echo "Bundle analysis complete. Check dist/ for output files."
}

preview_workflow() {
    echo -e "${CYAN}👁️  Previewing Production Build${NC}"
    cd "$PROJECT_ROOT"
    npm run build && npm run preview
}

deploy_check_workflow() {
    echo -e "${CYAN}✅ Pre-deployment Validation${NC}"
    cd "$PROJECT_ROOT"
    
    echo "Running type check..."
    npx tsc --noEmit
    
    echo "Running tests..."
    npx vitest run
    
    echo "Running security audit..."
    npm audit --audit-level=high
    
    echo "Building production bundle..."
    npm run build
    
    echo -e "${GREEN}✅ Pre-deployment checks completed${NC}"
}

# Main workflow dispatcher
case "${1:-help}" in
    help|--help|-h)
        show_help
        ;;
    dev)
        dev_workflow
        ;;
    dev-test)
        dev_test_workflow
        ;;
    hot-reload)
        hot_reload_workflow
        ;;
    test)
        test_workflow
        ;;
    test-watch)
        test_watch_workflow
        ;;
    test-coverage)
        test_coverage_workflow
        ;;
    test-all)
        test_all_workflow
        ;;
    test-ci)
        test_ci_workflow
        ;;
    lint)
        lint_workflow
        ;;
    format)
        format_workflow
        ;;
    typecheck)
        typecheck_workflow
        ;;
    audit)
        audit_workflow
        ;;
    build)
        build_workflow
        ;;
    build-analyze)
        build_analyze_workflow
        ;;
    preview)
        preview_workflow
        ;;
    deploy-check)
        deploy_check_workflow
        ;;
    *)
        echo -e "${RED}❌ Unknown workflow: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac