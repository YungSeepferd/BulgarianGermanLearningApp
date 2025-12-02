#!/bin/bash

# Build script for Bulgarian-German Learning App (SvelteKit SSG)
set -e

echo "🚀 Building Bulgarian-German Learning App (SvelteKit)..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_dependencies() {
    echo -e "${BLUE}📋 Checking dependencies...${NC}"
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm not found. Please install Node.js 18+.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All dependencies found${NC}"
}

# Install Node.js dependencies
install_node_deps() {
    echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Node.js dependencies installed${NC}"
}

# Build SvelteKit site
build_sveltekit() {
    echo -e "${BLUE}🏗️  Building SvelteKit site...${NC}"
    
    if [ "$1" = "production" ]; then
        echo -e "${YELLOW}Building for production...${NC}"
        cd svelte-frontend && npm run build
    else
        echo -e "${YELLOW}Building for development...${NC}"
        cd svelte-frontend && npm run build
    fi
    
    echo -e "${GREEN}✅ SvelteKit site built${NC}"
}

# Start development server
dev_server() {
    echo -e "${BLUE}🚀 Starting development server...${NC}"
    echo -e "${YELLOW}Server will be available at: http://localhost:5173${NC}"
    cd svelte-frontend && npm run dev
}

# Clean build artifacts
clean() {
    echo -e "${BLUE}🧹 Cleaning build artifacts...${NC}"
    rm -rf svelte-frontend/build/
    echo -e "${GREEN}✅ Clean complete${NC}"
}

# Main build function
build() {
    local mode=${1:-development}
    
    echo -e "${GREEN}🎯 Building in ${mode} mode${NC}"
    
    check_dependencies
    install_node_deps
    build_sveltekit $mode
    
    echo -e "${GREEN}🎉 Build complete!${NC}"
}

# Show help
show_help() {
    echo "Bulgarian-German Learning App Build Script (SvelteKit)"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build [dev|prod]  Build the application (default: dev)"
    echo "  dev               Start development server"
    echo "  clean             Clean build artifacts"
    echo "  deps              Check dependencies"
    echo "  help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build          # Build for development"
    echo "  $0 build prod     # Build for production"
    echo "  $0 dev            # Start development server"
    echo "  $0 clean          # Clean build artifacts"
}

# Parse command line arguments
case "${1:-build}" in
    "build")
        if [ "$2" = "prod" ] || [ "$2" = "production" ]; then
            build production
        else
            build development
        fi
        ;;
    "dev"|"serve")
        check_dependencies
        install_node_deps
        dev_server
        ;;
    "clean")
        clean
        ;;
    "deps")
        check_dependencies
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
