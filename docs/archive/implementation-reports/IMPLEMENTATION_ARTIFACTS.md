# Roo Code Agent Configuration Implementation Artifacts

## Phase 1: Modelfiles

### 1. Planner Modelfile (Kimi K2 Thinking) - `roo-planner.Modelfile`

```dockerfile
# Roo Code Planner - Strategic Planning & Creative Problem Solving
FROM kimi-k2-thinking:cloud

# Maximizes coherence using large native context
PARAMETER num_ctx 200000

# High temperature for creative reasoning and planning
PARAMETER temperature 1.0

# Flexibility for exploring multiple solution pathways
PARAMETER top_p 0.9

# Optimized for agentic workflows and long-horizon planning
SYSTEM """You are Roo Code Planner, an expert strategic planning AI. 
Your role is to analyze complex requests, decompose them into actionable steps, 
and create comprehensive implementation plans. You excel at creative problem-solving, 
tool selection, and multi-step workflow design. Always think step-by-step and 
consider multiple approaches before recommending the optimal path forward."""
```

### 2. Executor Modelfile (MiniMax M2) - `roo-executor.Modelfile`

```dockerfile
# Roo Code Executor - Deterministic Implementation & High-Throughput Execution
FROM minimax-m2:cloud

# Maximizes context for complex file analysis
PARAMETER num_ctx 200000

# Ultra-low temperature for deterministic code implementation
PARAMETER temperature 0.1

# Focused, conservative output for reliability
PARAMETER top_p 0.5

# Optimized for precise code generation and file operations
SYSTEM """You are Roo Code Executor, an expert implementation AI. 
Your role is to execute plans with maximum precision and reliability. 
You generate clean, efficient code and perform file operations with 
deterministic accuracy. Follow specifications exactly and avoid 
creative deviations from the provided requirements."""
```

### 3. Reasoner Modelfile (DeepSeek-V3) - `roo-reasoner.Modelfile`

```dockerfile
# Roo Code Reasoner - Pure Logic & Mathematical Precision
FROM deepseek-v3.1:671-cloud

# Extended context for complex reasoning chains
PARAMETER num_ctx 200000

# Zero temperature for maximum logical determinism
PARAMETER temperature 0.0

# Conservative sampling for precision
PARAMETER top_p 0.5

# Optimized for mathematical and algorithmic tasks
SYSTEM """You are Roo Code Reasoner, an expert logical reasoning AI. 
Your role is to solve complex mathematical problems, design algorithms, 
and provide precise logical analysis. You excel at mathematical computation, 
formal verification, and algorithmic optimization. Always provide 
step-by-step logical reasoning with mathematical rigor."""
```

### 4. Context Modelfile (GLM-4.6) - `roo-context.Modelfile`

```dockerfile
# Roo Code Context - Extended Document Analysis & Enterprise Tasks
FROM glm-4.6:cloud

# Leverage full 200K native context capacity
PARAMETER num_ctx 200000

# Balanced temperature for document processing
PARAMETER temperature 0.3

# Flexible sampling for comprehensive analysis
PARAMETER top_p 0.8

# Optimized for large-scale document and codebase analysis
SYSTEM """You are Roo Code Context, an expert document analysis AI. 
Your role is to process and analyze large documents, multi-module codebases, 
and enterprise-scale content. You excel at maintaining context across 
extensive inputs and providing comprehensive insights. Always consider 
the full scope of the provided context in your analysis."""
```

### 5. Visual Modelfile (Qwen3-VL) - `roo-visual.Modelfile`

```dockerfile
# Roo Code Visual - Multimodal Design & GUI Automation
FROM qwen3-vl:cloud

# Maximum context for visual-heavy tasks
PARAMETER num_ctx 256000

# Creative temperature for visual interpretation
PARAMETER temperature 0.7

# Flexible sampling for diverse visual inputs
PARAMETER top_p 0.9

# Optimized for design-to-code and visual reasoning
SYSTEM """You are Roo Code Visual, an expert multimodal AI. 
Your role is to interpret visual designs, automate GUI interactions, 
and translate visual concepts into functional code. You excel at 
design-to-code workflows, visual problem-solving, and cross-modal 
reasoning. Always provide detailed analysis of visual inputs."""
```

## Phase 2: Ollama Create Commands

```bash
# Create Planner Model
ollama create roo-planner -f ./roo-planner.Modelfile

# Create Executor Model  
ollama create roo-executor -f ./roo-executor.Modelfile

# Create Reasoner Model
ollama create roo-reasoner -f ./roo-reasoner.Modelfile

# Create Context Model
ollama create roo-context -f ./roo-context.Modelfile

# Create Visual Model
ollama create roo-visual -f ./roo-visual.Modelfile
```

## Phase 3: Roo Code API Configuration Profiles

```json
{
  "profiles": {
    "Planner (Kimi K2)": {
      "model": "roo-planner",
      "temperature": 1.0,
      "description": "Strategic planning and creative problem decomposition",
      "useCases": ["Architecture design", "Feature planning", "Problem decomposition", "Tool selection"]
    },
    "Executor (MiniMax M2)": {
      "model": "roo-executor", 
      "temperature": 0.1,
      "description": "Deterministic code implementation and high-throughput execution",
      "useCases": ["Code generation", "File operations", "Command execution", "Bug fixes"]
    },
    "Reasoner (DeepSeek-V3)": {
      "model": "roo-reasoner",
      "temperature": 0.0,
      "description": "Pure logical reasoning and mathematical precision",
      "useCases": ["Algorithm design", "Mathematical computation", "Logical verification", "Complex debugging"]
    },
    "Context (GLM-4.6)": {
      "model": "roo-context",
      "temperature": 0.3,
      "description": "Extended context handling and enterprise document analysis",
      "useCases": ["Large document processing", "Multi-module analysis", "Codebase review", "Documentation generation"]
    },
    "Visual (Qwen3-VL)": {
      "model": "roo-visual",
      "temperature": 0.7,
      "description": "Multimodal tasks and design-to-code workflows",
      "useCases": ["UI implementation", "Design conversion", "Visual testing", "GUI automation"]
    }
  }
}
```

## Phase 4: VS Code Settings Configuration

```json
{
  "roo-cline.terminalOutputLineLimit": 500,
  "roo-cline.defaultProfile": "Executor (MiniMax M2)",
  "roo-cline.autoSwitchProfiles": true,
  "roo-cline.profileRouting": {
    "planning": "Planner (Kimi K2)",
    "implementation": "Executor (MiniMax M2)", 
    "reasoning": "Reasoner (DeepSeek-V3)",
    "context": "Context (GLM-4.6)",
    "visual": "Visual (Qwen3-VL)"
  },
  "roo-cline.contextOptimization": {
    "maxContextTokens": 200000,
    "compressTerminalOutput": true,
    "preserveThinkingHistory": true
  }
}
```

## Phase 5: Project Template Structure

### Directory Structure
```
your-project/
├── .roocode/
│   ├── modelfiles/
│   │   ├── roo-planner.Modelfile
│   │   ├── roo-executor.Modelfile
│   │   ├── roo-reasoner.Modelfile
│   │   ├── roo-context.Modelfile
│   │   └── roo-visual.Modelfile
│   ├── profiles.json
│   ├── settings.json
│   └── README.md
└── .vscode/
    └── settings.json
```

### Installation Script - `setup.sh`
```bash
#!/bin/bash

# Roo Code Agent Setup Script
echo "Setting up Roo Code Agent Configuration..."

# Create modelfiles directory
mkdir -p .roocode/modelfiles

# Copy modelfiles
cp modelfiles/*.Modelfile .roocode/modelfiles/

# Create models
echo "Creating Roo Code models..."
ollama create roo-planner -f .roocode/modelfiles/roo-planner.Modelfile
ollama create roo-executor -f .roocode/modelfiles/roo-executor.Modelfile
ollama create roo-reasoner -f .roocode/modelfiles/roo-reasoner.Modelfile
ollama create roo-context -f .roocode/modelfiles/roo-context.Modelfile
ollama create roo-visual -f .roocode/modelfiles/roo-visual.Modelfile

echo "Setup complete! Configure Roo Code with the provided profiles."
```

## Phase 6: Task-Based Routing Guide

### Model Selection Matrix

| Task Type | Recommended Model | Temperature | Rationale |
|-----------|-------------------|-------------|-----------|
| **Architecture Design** | Planner (Kimi K2) | 1.0 | Creative exploration of multiple approaches |
| **Algorithm Development** | Reasoner (DeepSeek-V3) | 0.0 | Mathematical precision and logical rigor |
| **Code Implementation** | Executor (MiniMax M2) | 0.1 | Deterministic, reliable code generation |
| **Large Document Analysis** | Context (GLM-4.6) | 0.3 | Extended context retention |
| **UI/Design Implementation** | Visual (Qwen3-VL) | 0.7 | Visual interpretation and design conversion |
| **Bug Fixing** | Executor (MiniMax M2) | 0.1 | Precise, targeted fixes |
| **Feature Planning** | Planner (Kimi K2) | 1.0 | Comprehensive feature decomposition |
| **Performance Optimization** | Reasoner (DeepSeek-V3) | 0.0 | Analytical optimization |
| **Multi-file Refactoring** | Context (GLM-4.6) | 0.3 | Cross-file context awareness |

### Workflow Patterns

#### 1. Standard Development Workflow
```
Planning Phase → Planner (Kimi K2) → Implementation Phase → Executor (MiniMax M2)
```

#### 2. Algorithm-Heavy Development
```
Design Phase → Reasoner (DeepSeek-V3) → Implementation Phase → Executor (MiniMax M2)
```

#### 3. Large-Scale Project
```
Analysis Phase → Context (GLM-4.6) → Planning Phase → Planner (Kimi K2) → Implementation Phase → Executor (MiniMax M2)
```

#### 4. Design-to-Code
```
Design Analysis → Visual (Qwen3-VL) → Planning Phase → Planner (Kimi K2) → Implementation Phase → Executor (MiniMax M2)
```

## Phase 7: Bulgarian Learning Project Specific Configuration

### Additional System Prompts for Language Learning

#### Planner System Prompt Addition
```dockerfile
SYSTEM """You are Roo Code Planner, an expert strategic planning AI specializing in language learning applications.
Your role includes analyzing Bulgarian language learning requirements, designing educational workflows, 
and planning culturally appropriate content structures. You excel at breaking down complex language 
learning concepts into manageable, pedagogically sound steps. Consider both technical implementation 
and educational best practices in your planning."""
```

#### Executor System Prompt Addition
```dockerfile
SYSTEM """You are Roo Code Executor, an expert implementation AI specializing in language learning applications.
Your role includes implementing Bulgarian language features, creating educational interfaces, 
and building robust language learning tools. You generate clean, efficient code with special 
attention to internationalization, accessibility, and educational user experience. 
Follow specifications exactly and ensure cultural and linguistic accuracy."""
```

### Project-Specific Routing Rules
```json
{
  "projectRouting": {
    "bulgarian-learning": {
      "content-creation": "Planner (Kimi K2)",
      "vocabulary-implementation": "Executor (MiniMax M2)",
      "grammar-analysis": "Reasoner (DeepSeek-V3)",
      "course-structure": "Context (GLM-4.6)",
      "ui-design": "Visual (Qwen3-VL)"
    }
  }
}
```

## Phase 8: Performance Monitoring & Optimization

### Metrics to Track
- **Task Completion Rate**: Success rate per model type
- **Context Window Usage**: Monitor token consumption
- **Cost Efficiency**: Track CPS-TC (Cost Per Successful Task Completion)
- **Latency**: Response times per model
- **Error Rates**: Implementation accuracy per model

### Optimization Strategies
1. **Dynamic Profile Switching**: Auto-select optimal model based on task analysis
2. **Context Compression**: Implement smart context management for large projects
3. **Caching**: Cache frequent patterns and responses
4. **Load Balancing**: Distribute tasks across models for optimal throughput

## Implementation Checklist

### Pre-Implementation
- [ ] Verify Ollama cloud access for all required models
- [ ] Test base model functionality before customization
- [ ] Backup existing Roo Code configuration

### Implementation Steps
- [ ] Create all 5 Modelfiles with exact specifications
- [ ] Execute ollama create commands for each model
- [ ] Configure Roo Code profiles with JSON settings
- [ ] Update VS Code settings for agent optimization
- [ ] Test each model with appropriate task types
- [ ] Validate profile switching functionality
- [ ] Implement project-specific routing rules

### Post-Implementation
- [ ] Monitor performance metrics for 1 week
- [ ] Fine-tune temperature settings based on results
- [ ] Document any project-specific modifications
- [ ] Create team training materials for model selection
- [ ] Establish maintenance schedule for model updates

This comprehensive configuration provides enterprise-grade AI agent capabilities with optimal performance, cost efficiency, and reliability across all development workflows.