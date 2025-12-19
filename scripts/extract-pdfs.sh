#!/bin/bash

# PDF Text Extraction Script
# Extracts text from PDFs and saves to .txt files for easier processing

set -e

RESOURCES_DIR="data/vocab/resources"
OUTPUT_DIR="$RESOURCES_DIR/extracted"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📄 PDF Text Extraction Script${NC}"
echo "=================================="
echo ""

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Check if pdftotext is available (from poppler-utils)
if ! command -v pdftotext &> /dev/null; then
    echo -e "${YELLOW}⚠️  pdftotext not found. Installing poppler...${NC}"
    
    # Detect OS and install poppler
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            echo "Installing via Homebrew..."
            brew install poppler
        else
            echo "Please install Homebrew first: https://brew.sh"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y poppler-utils
        elif command -v yum &> /dev/null; then
            sudo yum install -y poppler-utils
        else
            echo "Please install poppler-utils manually"
            exit 1
        fi
    else
        echo "Unsupported OS. Please install poppler-utils manually."
        exit 1
    fi
fi

echo -e "${GREEN}✓ pdftotext available${NC}"
echo ""

# Count PDFs
pdf_count=$(find "$RESOURCES_DIR" -maxdepth 1 -name "*.pdf" | wc -l | tr -d ' ')
echo "Found $pdf_count PDF files"
echo ""

# Extract each PDF
counter=0
for pdf in "$RESOURCES_DIR"/*.pdf; do
    if [ -f "$pdf" ]; then
        counter=$((counter + 1))
        basename=$(basename "$pdf" .pdf)
        output_file="$OUTPUT_DIR/${basename}.txt"
        
        echo -e "${BLUE}[$counter/$pdf_count]${NC} Extracting: $basename.pdf"
        
        # Extract text with layout preservation
        pdftotext -layout "$pdf" "$output_file" 2>/dev/null || \
        pdftotext "$pdf" "$output_file" 2>/dev/null
        
        # Check if extraction was successful
        if [ -f "$output_file" ] && [ -s "$output_file" ]; then
            size=$(wc -c < "$output_file" | tr -d ' ')
            echo -e "  ${GREEN}✓${NC} Extracted ${size} bytes → ${output_file}"
        else
            echo -e "  ${YELLOW}⚠${NC} Failed or empty file"
        fi
        echo ""
    fi
done

echo "=================================="
echo -e "${GREEN}✅ Extraction complete!${NC}"
echo ""
echo "Extracted files location:"
echo "  → $OUTPUT_DIR/"
echo ""
echo "Next steps:"
echo "  1. Review extracted .txt files"
echo "  2. Run vocabulary extraction script"
echo "  3. Validate extracted vocabulary"
