#!/bin/bash

# Build script for Bulgarian-German Learning App
set -e

echo "🚀 Building Bulgarian-German Learning App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_dependencies() {
    echo -e "${BLUE}📋 Checking dependencies...${NC}"
    
    if ! command -v hugo &> /dev/null; then
        echo -e "${RED}❌ Hugo not found. Please install Hugo Extended.${NC}"
        exit 1
    fi
    
    if ! command -v go &> /dev/null; then
        echo -e "${RED}❌ Go not found. Please install Go 1.21+.${NC}"
        exit 1
    fi
    
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

# Build Go tools
build_go_tools() {
    echo -e "${BLUE}🔧 Building Go tools...${NC}"
    cd tools
    go mod download
    go build -o ../bin/hugo-bg-de ./cmd/hugo-bg-de
    cd ..
    echo -e "${GREEN}✅ Go tools built${NC}"
}

# Process data
process_data() {
    echo -e "${BLUE}📊 Processing data...${NC}"
    ./bin/hugo-bg-de process-data
    ./bin/hugo-bg-de validate
    echo -e "${GREEN}✅ Data processed${NC}"
}

# Build Hugo site
build_hugo() {
    echo -e "${BLUE}🏗️  Building Hugo site...${NC}"
    
    if [ "$1" = "production" ]; then
        echo -e "${YELLOW}Building for production...${NC}"
        HUGO_ENVIRONMENT=production hugo --gc --minify
    else
        echo -e "${YELLOW}Building for development...${NC}"
        hugo --buildDrafts --buildFuture
    fi
    
    echo -e "${GREEN}✅ Hugo site built${NC}"
}

# Generate PWA assets
generate_pwa() {
    echo -e "${BLUE}📱 Generating PWA assets...${NC}"
    ./bin/hugo-bg-de generate-sw
    ./bin/hugo-bg-de generate-manifest
    echo -e "${GREEN}✅ PWA assets generated${NC}"
}

# Start development server
dev_server() {
    echo -e "${BLUE}🚀 Starting development server...${NC}"
    echo -e "${YELLOW}Server will be available at: http://localhost:1313${NC}"
    hugo server --buildDrafts --buildFuture --watch
}

# Clean build artifacts
clean() {
    echo -e "${BLUE}🧹 Cleaning build artifacts...${NC}"
    rm -rf public/
    rm -rf resources/
    rm -rf bin/
    echo -e "${GREEN}✅ Clean complete${NC}"
}

# Main build function
build() {
    local mode=${1:-development}
    
    echo -e "${GREEN}🎯 Building in ${mode} mode${NC}"
    
    check_dependencies
    install_node_deps
    build_go_tools
    process_data
    build_hugo $mode
    
    if [ "$mode" = "production" ]; then
        generate_pwa
    fi
    
    echo -e "${GREEN}🎉 Build complete!${NC}"
}

# Show help
show_help() {
    echo "Bulgarian-German Learning App Build Script"
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
        build_go_tools
        process_data
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
