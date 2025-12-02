#!/bin/bash
set -e

# Configuration
LOG_FILE="_cleanup.log"
ARCHIVE_DIR="_legacy_archive"
LEGACY_PATTERNS=(
    "content"
    "technical-debt*" 
    "remediation*" 
    "data/archive-data-cleanup"
    "data/_raw_backup"
    "hugo.toml"
    "themes"
    "layouts"
    "archetypes"
    "resources"
    "build.sh"
)

# Logging function
log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "$msg"
    echo "$msg" >> "$LOG_FILE"
}

log "🔧 Starting strict cleanup and refactor..."

# 1. Create Archive Directory
if [ ! -d "$ARCHIVE_DIR" ]; then
    mkdir -p "$ARCHIVE_DIR"
    log "📂 Created archive directory: $ARCHIVE_DIR"
else
    log "ℹ️  Archive directory exists: $ARCHIVE_DIR"
fi

# 2. Archive Legacy Items
for pattern in "${LEGACY_PATTERNS[@]}"; do
    # Find files/dirs matching pattern at root or specific paths
    # Using 'find' with safe handling for names
    find . -maxdepth 2 -path "./$pattern" -print0 2>/dev/null | while IFS= read -r -d '' item; do
        if [ -e "$item" ]; then
            # Preserve directory structure in archive
            rel_path="${item#./}"
            target_dir="$ARCHIVE_DIR/$(dirname "$rel_path")"
            mkdir -p "$target_dir"
            
            log "📦 Archiving: $item to $target_dir"
            mv "$item" "$target_dir/"
        fi
    done
done

# 3. Clean up empty parent directories of moved items (like 'data')
if [ -d "data" ] && [ -z "$(ls -A data)" ]; then
    log "🗑️  Removing empty data directory"
    rmdir data
fi

# 4. Promote svelte-frontend (if it exists)
if [ -d "svelte-frontend" ]; then
    log "🚀 Promoting svelte-frontend to root..."
    # Move hidden files and normal files
    shopt -s dotglob
    mv svelte-frontend/* . 2>/dev/null || true
    shopt -u dotglob
    rmdir svelte-frontend
    log "✅ Promoted svelte-frontend contents"
else
    log "ℹ️  svelte-frontend directory not found (project likely already flattened)"
fi

log "🎉 Refactor complete. Check $LOG_FILE for details."