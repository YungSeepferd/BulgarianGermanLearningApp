# Development Process Rules

## 🎯 Purpose
This document establishes rules for efficient and consistent development processes, including code analysis, documentation maintenance, and operational workflows.

---

## 🔍 Code Analysis Rules

### **1. Codebase Search**
- **Rule:** Always use [`codebase_search`](command:codebase_search) to analyze the indexed codebase before making changes.
- **Constraint:** Use `codebase_search` FIRST for ANY exploration of code you haven't examined yet in this conversation.
- **Reasoning:** Semantic search finds functionally relevant code based on meaning, not just keywords, making it more effective than regex-based searches.

### **2. File Examination**
- **Rule:** Always read a file's contents using [`read_file`](command:read_file) before attempting to edit it.
- **Constraint:** Never make assumptions about file content or structure without examining it first.
- **Best Practice:** Review at least 20 lines before and after any section you plan to modify.

---

## 📚 Documentation Maintenance Rules

### **1. Single Source of Truth**
- **Rule:** Maintain these critical documentation files in `/docs` or appropriate subdirectories:
  - `CURRENT_WORK_PLAN.md` - Active development priorities
  - `README.md` - Project overview and setup instructions
  - `ROADMAP_DETAILED.md` - Detailed implementation roadmap
  - `DESIGN_CONCEPT.md` - Design principles and strategy
  - `NEXT_STEPS_PLAN.md` - Immediate action items

- **Constraint:** If these files don't exist in `/docs`, create them and update all references.
- **Rule:** Keep these files updated to reflect the current state of the project.

### **2. Documentation Updates**
- **Rule:** Check and update relevant documentation files BEFORE making code changes.
- **Constraint:** Documentation updates must be atomic with code changes - never leave documentation outdated.
- **Best Practice:** Include documentation review in your pre-commit checklist.

---

## 🗃️ .roo Directory Maintenance Rules

### **1. Directory Preservation**
- **Rule:** Always preserve and actively maintain the `.roo/` directory structure.
- **Constraint:** Never delete or move the `.roo/` directory or its contents.

### **2. Rule File Maintenance**
- **Rule:** Regularly update rule files in these directories:
  - `.roo/rules/` - Core project rules
  - `.roo/rules-{mode}/` - Mode-specific rules (e.g., `rules-code/`, `rules-architect/`)

- **Constraint:** Ensure all mode-specific rule directories are synchronized and version-controlled.
- **Best Practice:** Review and update rules at least quarterly or after major process changes.

### **3. Configuration Files**
- **Rule:** Keep configuration files updated to reflect current project standards:
  - `mcp.json` - Model Context Protocol configuration
  - `config.json` - Project configuration
  - Other relevant configuration files

---

## 🧩 Development Workflow Rules

### **1. Microstep Definition**
- **Rule:** Define microsteps to avoid exceeding context size limits.
- **Constraint:** Break complex tasks into atomic steps that can be completed within context limits.
- **Best Practice:** Use the `update_todo_list` tool to track microsteps for complex tasks.

### **2. Testing Approach**
- **Rule:** Prefer MCP tools like Playwright MCP over terminal commands for manual testing.
- **Constraint:** Only use terminal commands when MCP tools cannot accomplish the testing objective.
- **Reasoning:** MCP tools provide better integration with the development environment and more consistent results.

### **3. Server Management**
- **Rule:** Always check if a server is running before starting another one.
- **Constraint:** Use ` pnpm dev` to run the dev server in the background when needed.
- **Best Practice:** Monitor active terminals in environment_details to avoid duplicate server instances.

---

## 🛠️ Tools and Automation

### **1. Tool Selection Priority**
| Priority | Tool Type | When to Use |
|----------|-----------|-------------|
| 1 | `codebase_search` | Initial exploration of any new code area |
| 2 | `read_file` | Examining file contents before editing |
| 3 | `apply_diff` | Making targeted changes to existing files |
| 4 | `write_to_file` | Creating new files or complete rewrites |
| 5 | MCP Tools | When specialized functionality is available |
| 6 | Terminal Commands | Only when other tools cannot accomplish the task |

### **2. Server Management Commands**
```bash
# Check for running processes
ps aux | grep pnpm

# Start dev server in background
pnpm dev

# Kill existing server (if needed)
pkill -f "pnpm dev"
```

---

## 📅 Maintenance Schedule

| Frequency   | Task |
|-------------|------|
| **Before each change** | Use `codebase_search` for new code areas |
| **Before each edit** | Read file contents with `read_file` |
| **With each code change** | Update relevant documentation |
| **Weekly** | Review and update `.roo/` rules |
| **Monthly** | Audit configuration files for consistency |

---

## 🚀 Enforcement
- **Pre-commit Checks**: Always use `codebase_search` before exploring new code areas
- **Documentation Requirements**: Documentation must be updated with all code changes
- **Rule Reviews**: Regularly review and update `.roo/` rules to reflect current practices
- **Configuration Audits**: Ensure configuration files are consistent with project standards

---

## 📋 Development Process Checklist

### **Pre-Change Checklist**
- [ ] Used `codebase_search` to analyze relevant code areas
- [ ] Read target file contents with `read_file`
- [ ] Checked `CURRENT_WORK_PLAN.md` for active priorities
- [ ] Verified server status (running/stopped as needed)

### **Change Implementation Checklist**
- [ ] Made targeted changes using `apply_diff` or `write_to_file`
- [ ] Updated relevant documentation files
- [ ] Defined microsteps for complex tasks
- [ ] Used appropriate testing tools (MCP preferred)

### **Post-Change Checklist**
- [ ] Verified changes work as intended
- [ ] Updated `NEXT_STEPS_PLAN.md` with follow-up actions
- [ ] Reviewed `.roo/` rules for needed updates
- [ ] Checked configuration files for consistency

---

## 🔗 Related Documents
- [Workflow Rules](/.roo/rules/30-workflow.md)
- [Documentation Maintenance Rules](/.roo/rules/95-documentation-maintenance.md)
- [Behavior Rules](/.roo/rules/90-behavior.md)

---

## 🔄 Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-12-09 | Roo | Initial version |