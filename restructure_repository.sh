#!/bin/bash

# Repository Restructuring Script
# This script performs a complete restructuring of the repository while preserving Git history

# Safety features
set -euo pipefail

# Configuration
REPO_ROOT=$(git rev-parse --show-toplevel)
BACKUP_DIR="${REPO_ROOT}/_migration_backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Function to create backup
create_backup() {
    echo "Creating backup in ${BACKUP_DIR}..."
    mkdir -p "${BACKUP_DIR}"
    git archive --format=tar HEAD | (cd "${BACKUP_DIR}" && tar xf -)
    echo "Backup created successfully."
}

# Function to verify Git repository
verify_git_repo() {
    if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        echo "Error: Not in a Git repository. Aborting."
        exit 1
    fi
}

# Function to archive report files
archive_reports() {
    echo "Archiving report files to docs/reports_archive/..."

    # Create archive directory if it doesn't exist
    mkdir -p "${REPO_ROOT}/docs/reports_archive"

    # Archive each report file
    for file in "${REPO_ROOT}"/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            if [[ "$filename" != "README.md" && "$filename" != "SECURITY.md" ]]; then
                git mv "$file" "docs/reports_archive/$filename"
                echo "Archived $filename"
            fi
        fi
    done

    echo "Report archive completed."
}

# Function to move SvelteKit application
move_sveltekit_app() {
    echo "Moving SvelteKit application to repository root..."

    # Move files and directories with comprehensive error handling
    function safe_mv() {
        local src="$1"
        local dst="$2"
        local filename=$(basename "$dst")

        if [ -f "$src" ]; then
            if [ -e "$dst" ]; then
                echo "Warning: Destination $filename exists. Creating backup and overwriting..."
                mv "$dst" "$dst.bak" || { echo "Error: Failed to create backup for $filename"; return 1; }
            fi
            git mv "$src" "$dst" || { echo "Error: Failed to move $filename"; return 1; }
            echo "Successfully moved $filename"
        else
            echo "Warning: Source file $src does not exist"
            return 0
        fi
    }

    # Move files and directories
    safe_mv "${REPO_ROOT}/svelte-frontend/.eslintrc.json" "${REPO_ROOT}/.eslintrc.json"
    safe_mv "${REPO_ROOT}/svelte-frontend/.gitignore" "${REPO_ROOT}/.gitignore"
    safe_mv "${REPO_ROOT}/svelte-frontend/.npmrc" "${REPO_ROOT}/.npmrc"
    safe_mv "${REPO_ROOT}/svelte-frontend/build-config.cjs" "${REPO_ROOT}/build-config.cjs"
    safe_mv "${REPO_ROOT}/svelte-frontend/coverage.config.js" "${REPO_ROOT}/coverage.config.js"
    safe_mv "${REPO_ROOT}/svelte-frontend/DEPLOYMENT.md" "${REPO_ROOT}/DEPLOYMENT.md"
    safe_mv "${REPO_ROOT}/svelte-frontend/package-lock.json" "${REPO_ROOT}/package-lock.json"
    safe_mv "${REPO_ROOT}/svelte-frontend/package.json" "${REPO_ROOT}/package.json"
    safe_mv "${REPO_ROOT}/svelte-frontend/playwright-ct-simple.config.ts" "${REPO_ROOT}/playwright-ct-simple.config.ts"
    safe_mv "${REPO_ROOT}/svelte-frontend/playwright-ct.config.ts" "${REPO_ROOT}/playwright-ct.config.ts"
    safe_mv "${REPO_ROOT}/svelte-frontend/playwright.config.ts" "${REPO_ROOT}/playwright.config.ts"
    safe_mv "${REPO_ROOT}/svelte-frontend/README.md" "${REPO_ROOT}/README.md"
    safe_mv "${REPO_ROOT}/svelte-frontend/svelte.config.js" "${REPO_ROOT}/svelte.config.js"
    safe_mv "${REPO_ROOT}/svelte-frontend/src" "${REPO_ROOT}/src"
    safe_mv "${REPO_ROOT}/svelte-frontend/static" "${REPO_ROOT}/static"
    safe_mv "${REPO_ROOT}/svelte-frontend/tests" "${REPO_ROOT}/tests"
    safe_mv "${REPO_ROOT}/svelte-frontend/scripts" "${REPO_ROOT}/scripts"
    git mv "${REPO_ROOT}/svelte-frontend/.gitignore" "${REPO_ROOT}/.gitignore"
    git mv "${REPO_ROOT}/svelte-frontend/.npmrc" "${REPO_ROOT}/.npmrc"
    git mv "${REPO_ROOT}/svelte-frontend/build-config.cjs" "${REPO_ROOT}/build-config.cjs"
    git mv "${REPO_ROOT}/svelte-frontend/coverage.config.js" "${REPO_ROOT}/coverage.config.js"
    git mv "${REPO_ROOT}/svelte-frontend/DEPLOYMENT.md" "${REPO_ROOT}/DEPLOYMENT.md"
    git mv "${REPO_ROOT}/svelte-frontend/package-lock.json" "${REPO_ROOT}/package-lock.json"
    git mv "${REPO_ROOT}/svelte-frontend/package.json" "${REPO_ROOT}/package.json" || echo "Warning: Failed to move package.json"
    git mv "${REPO_ROOT}/svelte-frontend/playwright-ct-simple.config.ts" "${REPO_ROOT}/playwright-ct-simple.config.ts" || echo "Warning: Failed to move playwright-ct-simple.config.ts"
    git mv "${REPO_ROOT}/svelte-frontend/playwright-ct.config.ts" "${REPO_ROOT}/playwright-ct.config.ts" || echo "Warning: Failed to move playwright-ct.config.ts"
    git mv "${REPO_ROOT}/svelte-frontend/playwright.config.ts" "${REPO_ROOT}/playwright.config.ts" || echo "Warning: Failed to move playwright.config.ts"
    git mv "${REPO_ROOT}/svelte-frontend/README.md" "${REPO_ROOT}/README.md" || echo "Warning: Failed to move README.md"
    git mv "${REPO_ROOT}/svelte-frontend/svelte.config.js" "${REPO_ROOT}/svelte.config.js" || echo "Warning: Failed to move svelte.config.js"
    git mv "${REPO_ROOT}/svelte-frontend/src" "${REPO_ROOT}/src" || echo "Warning: Failed to move src directory"
    git mv "${REPO_ROOT}/svelte-frontend/static" "${REPO_ROOT}/static" || echo "Warning: Failed to move static directory"
    git mv "${REPO_ROOT}/svelte-frontend/tests" "${REPO_ROOT}/tests" || echo "Warning: Failed to move tests directory"
    git mv "${REPO_ROOT}/svelte-frontend/scripts" "${REPO_ROOT}/scripts" || echo "Warning: Failed to move scripts directory"

    # Remove empty svelte-frontend directory
    rmdir "${REPO_ROOT}/svelte-frontend"

    echo "SvelteKit application moved successfully."
}

# Function to centralize data files
centralize_data() {
    echo "Centralizing data files to src/lib/data/..."

    # Create data directory if it doesn't exist
    mkdir -p "${REPO_ROOT}/src/lib/data"

    # Move vocabulary data files
    git mv "${REPO_ROOT}/data/vocab/fragewörter.json" "${REPO_ROOT}/src/lib/data/fragewörter.json"
    git mv "${REPO_ROOT}/data/vocab/tiere.json" "${REPO_ROOT}/src/lib/data/tiere.json"
    git mv "${REPO_ROOT}/data/vocab/wetter.json" "${REPO_ROOT}/src/lib/data/wetter.json"
    git mv "${REPO_ROOT}/data/vocab/zahlen-A1.json" "${REPO_ROOT}/src/lib/data/zahlen-A1.json"

    # Move cultural grammar data
    git mv "${REPO_ROOT}/data/cultural-grammar.json" "${REPO_ROOT}/src/lib/data/cultural-grammar.json"

    # Move SvelteKit vocabulary data if it exists
    if [ -f "${REPO_ROOT}/svelte-frontend/data/vocabulary.json" ]; then
        git mv "${REPO_ROOT}/svelte-frontend/data/vocabulary.json" "${REPO_ROOT}/src/lib/data/vocabulary.json"
    fi

    echo "Data files centralized successfully."
}

# Function to remove empty directories and legacy files
cleanup_repository() {
    echo "Cleaning up repository..."

    # Remove empty directories
    find "${REPO_ROOT}" -type d -empty -delete

    # Remove legacy files if they exist
    if [ -d "${REPO_ROOT}/data/backups" ]; then
        rm -rf "${REPO_ROOT}/data/backups"
    fi

    # Remove legacy directories if they exist
    if [ -d "${REPO_ROOT}/svelte-frontend" ]; then
        rm -rf "${REPO_ROOT}/svelte-frontend"
    fi

    echo "Repository cleanup completed."
}

# Function to verify changes
verify_changes() {
    echo "Verifying changes..."

    # Check for untracked files
    if [ -n "$(git ls-files --others --exclude-standard)" ]; then
        echo "Warning: There are untracked files in the repository."
        git ls-files --others --exclude-standard
    fi

    # Check for staged changes
    if [ -n "$(git diff --cached --name-only)" ]; then
        echo "Staged changes:"
        git diff --cached --name-only
    fi

    # Check for unstaged changes
    if [ -n "$(git diff --name-only)" ]; then
        echo "Unstaged changes:"
        git diff --name-only
    fi

    echo "Verification completed."
}

# Main execution
main() {
    echo "Starting repository restructuring..."

    # Verify we're in a Git repository
    verify_git_repo

    # Create backup
    create_backup

    # Start a new branch for the restructuring
    git checkout -b "restructure-repo-${TIMESTAMP}"

    # Perform restructuring steps
    archive_reports
    move_sveltekit_app
    centralize_data
    cleanup_repository

    # Verify all changes
    verify_changes

    echo "Repository restructuring completed successfully."
    echo "Please review the changes and commit them when ready."
}

# Execute main function
main
