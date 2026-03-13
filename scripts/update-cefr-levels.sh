#!/bin/bash
# CEFR Level Update Script
# This script updates CEFR levels for all vocabulary items

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
INPUT_FILE="data/unified-vocabulary.json"
OUTPUT_FILE="data/unified-vocabulary-with-cefr.json"
BACKUP_DIR="data/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}=== CEFR Level Update ===${NC}"
echo "Input file: $INPUT_FILE"
echo "Output file: $OUTPUT_FILE"
echo

# Backup original file
if [ -f "$INPUT_FILE" ]; then
  BACKUP_FILE="$BACKUP_DIR/unified-vocabulary-$TIMESTAMP.json"
  echo -e "${GREEN}Creating backup...${NC}"
  cp "$INPUT_FILE" "$BACKUP_FILE"
  echo "Backup created: $BACKUP_FILE"
  echo
fi

# Run the CEFR population script
echo -e "${GREEN}Populating CEFR levels...${NC}"
npx tsx scripts/populate-cefr-levels-v3.ts "$INPUT_FILE" "$OUTPUT_FILE"
echo

# Show comparison
if [ -f "$INPUT_FILE" ] && [ -f "$OUTPUT_FILE" ]; then
  echo -e "${GREEN}Comparing files...${NC}"
  
  # Count items in each
  ORIGINAL_COUNT=$(jq 'length' "$INPUT_FILE")
  NEW_COUNT=$(jq 'length' "$OUTPUT_FILE")
  
  echo "Original items: $ORIGINAL_COUNT"
  echo "Updated items: $NEW_COUNT"
  echo
  
  # Show CEFR distribution
  echo -e "${YELLOW}CEFR Distribution:${NC}"
  jq -r '[.[].cefrLevel] | group_by(.) | map({level: .[0], count: length}) | sort_by(.level) | .[] | "  \(.level): \(.count) items"' "$OUTPUT_FILE"
fi

echo
echo -e "${GREEN}Done! ✓${NC}"
echo ""
echo "To apply changes, run:"
echo "  cp $OUTPUT_FILE $INPUT_FILE"
echo ""
echo "Or review the output file first:"
echo "  code $OUTPUT_FILE"
