#!/bin/bash

# Audiomage Test Execution Script
# This script provides easy access to all testing layers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}🎵 Audiomage Audio Workstation - Testing Suite${NC}"
    echo "=================================================="
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

run_unit_tests() {
    print_info "Running Unit Tests with Coverage"
    if npx vitest run --coverage; then
        print_success "Unit tests completed successfully"
    else
        print_error "Unit tests failed"
        exit 1
    fi
}

run_component_tests() {
    print_info "Running React Component Tests"
    if npx vitest run client/src/test/components; then
        print_success "Component tests completed successfully"
    else
        print_error "Component tests failed"
        exit 1
    fi
}

run_integration_tests() {
    print_info "Running Integration Tests"
    if npx vitest run client/src/test/integration; then
        print_success "Integration tests completed successfully"
    else
        print_error "Integration tests failed"
        exit 1
    fi
}

run_e2e_tests() {
    print_info "Running End-to-End Tests"
    print_warning "Note: E2E tests require Playwright browsers to be installed"
    if npx playwright test; then
        print_success "E2E tests completed successfully"
    else
        print_error "E2E tests failed"
        exit 1
    fi
}

run_smoke_tests() {
    print_info "Running Smoke Tests (Critical User Flows)"
    if npx playwright test --grep "@smoke"; then
        print_success "Smoke tests completed successfully"
    else
        print_error "Smoke tests failed"
        exit 1
    fi
}

run_accessibility_tests() {
    print_info "Running Accessibility Tests (WCAG Compliance)"
    if npx playwright test --config playwright-a11y.config.ts; then
        print_success "Accessibility tests completed successfully"
    else
        print_error "Accessibility tests failed"
        exit 1
    fi
}

run_performance_tests() {
    print_info "Running Performance Tests"
    if npx playwright test --config playwright-performance.config.ts; then
        print_success "Performance tests completed successfully"
    else
        print_error "Performance tests failed"
        exit 1
    fi
}

run_lint_check() {
    print_info "Running ESLint Code Quality Checks"
    if npx eslint . --ext .ts,.tsx; then
        print_success "Lint checks passed"
    else
        print_error "Lint checks failed"
        exit 1
    fi
}

run_format_check() {
    print_info "Running Prettier Format Checks"
    if npx prettier --check .; then
        print_success "Format checks passed"
    else
        print_error "Format checks failed"
        exit 1
    fi
}

run_security_audit() {
    print_info "Running Security Audit"
    if npm audit --audit-level moderate; then
        print_success "Security audit passed"
    else
        print_warning "Security audit found issues - review above output"
    fi
}

run_all_tests() {
    print_header
    print_info "Running Comprehensive Test Suite"
    
    echo ""
    echo "Test Execution Order:"
    echo "1. Code Quality (ESLint)"
    echo "2. Format Check (Prettier)"
    echo "3. Unit Tests"
    echo "4. Integration Tests"
    echo "5. Smoke Tests (E2E)"
    echo "6. Security Audit"
    echo ""
    
    run_lint_check
    echo ""
    
    run_format_check
    echo ""
    
    run_unit_tests
    echo ""
    
    run_integration_tests
    echo ""
    
    run_smoke_tests
    echo ""
    
    run_security_audit
    echo ""
    
    print_success "All tests completed successfully!"
}

show_help() {
    print_header
    echo ""
    echo "Usage: ./scripts/run-tests.sh [TEST_TYPE]"
    echo ""
    echo "Available test types:"
    echo "  unit            - Run unit tests with coverage"
    echo "  components      - Run React component tests"
    echo "  integration     - Run integration tests"
    echo "  e2e             - Run end-to-end tests"
    echo "  smoke           - Run smoke tests only"
    echo "  accessibility   - Run accessibility tests"
    echo "  performance     - Run performance tests"
    echo "  lint            - Run ESLint checks"
    echo "  format          - Run Prettier format checks"
    echo "  security        - Run security audit"
    echo "  all             - Run comprehensive test suite"
    echo "  help            - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/run-tests.sh unit"
    echo "  ./scripts/run-tests.sh all"
    echo "  ./scripts/run-tests.sh smoke"
}

# Main execution
case "$1" in
    "unit")
        print_header
        run_unit_tests
        ;;
    "components")
        print_header
        run_component_tests
        ;;
    "integration")
        print_header
        run_integration_tests
        ;;
    "e2e")
        print_header
        run_e2e_tests
        ;;
    "smoke")
        print_header
        run_smoke_tests
        ;;
    "accessibility")
        print_header
        run_accessibility_tests
        ;;
    "performance")
        print_header
        run_performance_tests
        ;;
    "lint")
        print_header
        run_lint_check
        ;;
    "format")
        print_header
        run_format_check
        ;;
    "security")
        print_header
        run_security_audit
        ;;
    "all")
        run_all_tests
        ;;
    "help"|"")
        show_help
        ;;
    *)
        print_error "Unknown test type: $1"
        show_help
        exit 1
        ;;
esac