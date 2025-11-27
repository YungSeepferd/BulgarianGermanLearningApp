#!/bin/bash
# Comprehensive Hugo Server Restart and Cache Diagnostic Script
# This script ensures a clean development environment

set -e

echo "🔍 Bulgarian-German Learning App - Clean Restart Diagnostic"
echo "============================================================"
echo ""

# Step 1: Check for running Hugo processes
echo "📋 Step 1: Checking for running Hugo processes..."
HUGO_PIDS=$(pgrep -f "hugo server" || true)
if [ -n "$HUGO_PIDS" ]; then
    echo "⚠️  Found running Hugo processes: $HUGO_PIDS"
    echo "   Killing them now..."
    pkill -f "hugo server" || true
    sleep 2
    echo "✅ Hugo processes killed"
else
    echo "✅ No Hugo processes running"
fi
echo ""

# Step 2: Check what's listening on port 1313
echo "📋 Step 2: Checking port 1313..."
PORT_CHECK=$(lsof -ti:1313 2>/dev/null || true)
if [ -n "$PORT_CHECK" ]; then
    echo "⚠️  Port 1313 is in use by process: $PORT_CHECK"
    echo "   Killing process..."
    kill -9 "$PORT_CHECK" 2>/dev/null || true
    sleep 1
    echo "✅ Port 1313 freed"
else
    echo "✅ Port 1313 is available"
fi
echo ""

# Step 3: Check for port 58516 (the problematic cached port)
echo "📋 Step 3: Checking for process on port 58516..."
OLD_PORT_CHECK=$(lsof -ti:58516 2>/dev/null || true)
if [ -n "$OLD_PORT_CHECK" ]; then
    echo "⚠️  WARNING: Port 58516 is in use by: $OLD_PORT_CHECK"
    echo "   This is the OLD port causing cache issues!"
    echo "   Killing process..."
    kill -9 "$OLD_PORT_CHECK" 2>/dev/null || true
    echo "✅ Port 58516 freed"
else
    echo "✅ Port 58516 is not in use (good)"
fi
echo ""

# Step 4: Clean build artifacts
echo "📋 Step 4: Cleaning build artifacts..."
if [ -d "public" ]; then
    echo "   Removing public/ directory..."
    rm -rf public
    echo "✅ public/ removed"
else
    echo "✅ public/ doesn't exist"
fi

if [ -d "resources" ]; then
    echo "   Removing resources/ directory..."
    rm -rf resources
    echo "✅ resources/ removed"
else
    echo "✅ resources/ doesn't exist"
fi
echo ""

# Step 5: Verify new files exist
echo "📋 Step 5: Verifying recent fixes are present..."
MISSING_FILES=""

if [ ! -f "content/about.md" ]; then
    MISSING_FILES="$MISSING_FILES\n  - content/about.md"
fi

if [ ! -f "content/methodology.md" ]; then
    MISSING_FILES="$MISSING_FILES\n  - content/methodology.md"
fi

if [ ! -f "static/favicon.svg" ]; then
    MISSING_FILES="$MISSING_FILES\n  - static/favicon.svg"
fi

if [ ! -f "CACHE_CLEARING.md" ]; then
    MISSING_FILES="$MISSING_FILES\n  - CACHE_CLEARING.md"
fi

if [ -n "$MISSING_FILES" ]; then
    echo "❌ ERROR: Missing files from latest commit:"
    echo -e "$MISSING_FILES"
    echo ""
    echo "   You need to pull the latest changes:"
    echo "   git pull origin main"
    exit 1
else
    echo "✅ All new files present"
fi
echo ""

# Step 6: Check for problematic CSP meta tag in templates
echo "📋 Step 6: Checking if CSP meta tag was removed..."
CSP_CHECK=$(grep -n "Content-Security-Policy" layouts/partials/head.html || true)
if [ -n "$CSP_CHECK" ]; then
    echo "❌ WARNING: CSP meta tag still present in layouts/partials/head.html"
    echo "   This should have been removed. Did you pull latest changes?"
    echo "   Line: $CSP_CHECK"
else
    echo "✅ CSP meta tag properly removed"
fi
echo ""

# Step 7: Check vocabulary template for pagination fix
echo "📋 Step 7: Checking vocabulary pagination fix..."
VOCAB_RANGE=$(grep -n 'range \$vocabulary' layouts/vocabulary/list.html || true)
if [ -n "$VOCAB_RANGE" ]; then
    echo "✅ Vocabulary template renders full dataset (pagination fix applied)"
else
    VOCAB_PAGED=$(grep -n 'range \$paginatedItems' layouts/vocabulary/list.html || true)
    if [ -n "$VOCAB_PAGED" ]; then
        echo "❌ WARNING: Vocabulary still uses old pagination"
        echo "   This should render all items, not paginated items"
        echo "   Did you pull latest changes?"
    fi
fi
echo ""

# Step 8: Check Git status
echo "📋 Step 8: Checking Git status..."
GIT_STATUS=$(git status --porcelain)
if [ -n "$GIT_STATUS" ]; then
    echo "⚠️  You have uncommitted changes:"
    git status --short
    echo ""
else
    echo "✅ Working directory clean"
fi

GIT_BRANCH=$(git branch --show-current)
echo "   Current branch: $GIT_BRANCH"

LATEST_COMMIT=$(git log -1 --oneline)
echo "   Latest commit: $LATEST_COMMIT"
echo ""

# Step 9: Start Hugo server with optimal settings
echo "📋 Step 9: Starting Hugo server..."
echo ""
echo "   Starting with these settings:"
echo "   - Port: 1313 (explicit)"
echo "   - BaseURL override: http://localhost:1313/"
echo "   - DisableFastRender: true (forces full rebuild)"
echo "   - NoHTTPCache: true (prevents HTTP caching)"
echo ""
echo "🚀 Starting Hugo server now..."
echo "============================================================"
echo ""

# Start Hugo with all cache-busting flags
hugo server \
    --port 1313 \
    --baseURL "http://localhost:1313/" \
    --disableFastRender \
    --noHTTPCache \
    --bind "127.0.0.1" \
    --buildDrafts=false \
    --gc

# This will run until Ctrl+C