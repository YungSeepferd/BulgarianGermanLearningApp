#!/bin/bash

# Roo Code Agent Setup Script
echo "Setting up Roo Code Agent Configuration..."

# Create modelfiles directory
mkdir -p .roocode/modelfiles

# Copy modelfiles to .roocode directory
echo "Copying Modelfiles..."
cp modelfiles/roo-planner.Modelfile .roocode/modelfiles/
cp modelfiles/roo-executor.Modelfile .roocode/modelfiles/
cp modelfiles/roo-reasoner.Modelfile .roocode/modelfiles/
cp modelfiles/roo-context.Modelfile .roocode/modelfiles/
cp modelfiles/roo-visual.Modelfile .roocode/modelfiles/

# Copy configuration files
echo "Copying configuration files..."
cp roo-code-profiles.json .roocode/profiles.json
cp vscode-settings.json .roocode/settings.json

# Create models
echo "Creating Roo Code models..."
ollama create roo-planner -f .roocode/modelfiles/roo-planner.Modelfile
ollama create roo-executor -f .roocode/modelfiles/roo-executor.Modelfile
ollama create roo-reasoner -f .roocode/modelfiles/roo-reasoner.Modelfile
ollama create roo-context -f .roocode/modelfiles/roo-context.Modelfile
ollama create roo-visual -f .roocode/modelfiles/roo-visual.Modelfile

echo "Setup complete! Configure Roo Code with the provided profiles."
echo ""
echo "Next steps:"
echo "1. Open Roo Code settings in VS Code"
echo "2. Import the profiles from .roocode/profiles.json"
echo "3. Configure VS Code settings with .roocode/settings.json"
echo "4. Test each model with appropriate tasks"