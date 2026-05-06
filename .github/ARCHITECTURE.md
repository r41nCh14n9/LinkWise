# .github/ Agent-Skill Architecture

> 📌 **Quick Navigation:**
> - **Agent Details** → See [`.github/agents/`](./agents/) for complete agent definitions
> - **How to Use** → See [`.github/skills/`](./skills/) for each agent's usage guide
> - **System Architecture** → See this document for integration patterns

## 📐 Design Philosophy: Separating Framework from Content

This `.github/` structure implements a **generic, reusable framework** that works independently from project-specific content. All project data is separated into `docs/` folder.

---

## 🎯 Core Principle: Deidentification

**`.github/` contains:**
- ✅ Generic agent definitions (no project names)
- ✅ Reusable skill implementations (no specific examples)
- ✅ Framework for how agents work together
- ✅ References to `docs/` for all concrete content

**`docs/` contains:**
- ✅ Project-specific outputs from agents
- ✅ Reference materials and guidelines
- ✅ Templates and examples for this project
- ✅ Input requirements for each agent

---

## 🏗️ Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    .github/ (Generic Framework)                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  agents/                       skills/                          │
│  ├── plan.agent.md             ├── plan/                        │
│  ├── reference.agent.md        ├── reference/                   │
│  ├── sa.agent.md               ├── sa/                          │
│  ├── sd.agent.md               ├── sd/                          │
│  ├── development.agent.md      ├── development/                 │
│  ├── review.agent.md (NEW)     ├── review/ (NEW)               │
│  └── test.agent.md             └── test/                        │
│                                                                  │
│  All reference docs/ folder for:                                │
│  - Output location: docs/*/                                     │
│  - Input references: docs/reference/                            │
│  - Guidelines: docs/reference/guidelines/                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                               ↕
                       (references only)
                               ↕
┌──────────────────────────────────────────────────────────────────┐
│                   docs/ (Project Content)                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  plans/              reference/ (consumed by all agents)         │
│  ├── active/         ├── guidelines/                             │
│  └── completed/      │   ├── GUIDELINES-Tech-Stack-v1.md        │
│                      │   ├── GUIDELINES-Coding-Standards-v1.md  │
│  analysis/           │   ├── GUIDELINES-Dev-Workflow-v1.md      │
│  ├── requirements/   │   └── GUIDELINES-Performance-Security-v1 │
│  └── system-analysis/├── templates/                             │
│                      │   ├── TEMPLATE-Component.ts              │
│  design/             │   ├── TEMPLATE-Service.ts                │
│  ├── architecture/   │   └── (other templates)                  │
│  ├── components/     └── examples/                              │
│  ├── apis/               ├── good/                              │
│  └── database/           └── anti-patterns/                     │
│                                                                  │
│  implementation/     (all outputs from agents)                  │
│  ├── code-records/                                              │
│  └── integration-guides/                                        │
│                                                                  │
│  review/                                                        │
│  ├── code-reviews/                                              │
│  ├── design-reviews/                                            │
│  └── requirements-reviews/                                      │
│                                                                  │
│  testing/                                                       │
│  ├── integration/                                               │
│  ├── user/                                                      │
│  └── unit/                                                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## � Complete Agent Data Flow

> **📌 Note:** Detailed agent specifications, inputs, and outputs are defined in `.github/agents/[agent-name].agent.md`
> This section shows the system-level data flow and integration patterns.

### Agent Quick Reference

| Agent | Definition | Skill Guide | Role |
|-------|------------|-------------|------|
| 🎯 **Reference** | [reference.agent.md](./agents/reference.agent.md) | [SKILL.md](./skills/reference/SKILL.md) | Foundation: Standards & Guidelines |
| 📋 **Plan** | [plan.agent.md](./agents/plan.agent.md) | [SKILL.md](./skills/plan/SKILL.md) | Project Planning & Roadmaps |
| 📊 **SA** | [sa.agent.md](./agents/sa.agent.md) | [SKILL.md](./skills/sa/SKILL.md) | Requirements Analysis |
| 🏗️ **SD** | [sd.agent.md](./agents/sd.agent.md) | [SKILL.md](./skills/sd/SKILL.md) | System Design & Architecture |
| 💻 **Development** | [development.agent.md](./agents/development.agent.md) | [SKILL.md](./skills/development/SKILL.md) | Feature Implementation |
| ✨ **Review** | [review.agent.md](./agents/review.agent.md) | [SKILL.md](./skills/review/SKILL.md) | Code & Design Quality |
| ✅ **Test** | [test.agent.md](./agents/test.agent.md) | [SKILL.md](./skills/test/SKILL.md) | Test Planning & QA |

---

### System-Level Data Flow
```
Reference Agent (Maintains Standards)
    ↓ produces
    docs/reference/
    ├── guidelines/ (Tech stack, naming, coding standards, workflow, security/performance)
    ├── templates/ (Code and test templates)
    └── examples/ (Good implementations, anti-patterns)
        ↓ consumed by all agents
        ├────→ Plan Agent (workflow guidelines, naming conventions)
        ├────→ SA Agent (tech stack, architecture guidelines)
        ├────→ SD Agent (design standards, performance/security guidelines)
        ├────→ Development Agent (MUST follow ALL guidelines strictly)
        ├────→ Review Agent (guidelines for compliance verification)
        └────→ Test Agent (testing guidelines, test templates)
            ↓
Plan Agent → docs/plans/ (project timeline)
    ↓ provides context for
SA Agent → docs/analysis/ (functional/non-functional requirements)
    ↓ provides input for
SD Agent → docs/design/ (architecture and specifications)
    ↓ provides design for
Development Agent → docs/implementation/ (working code & documentation)
    ↓ provides implementation for
Review Agent → docs/review/ (code/design/requirements reviews)
    ├─ CODE-REVIEW-*.md (code compliance issues)
    ├─ DESIGN-REVIEW-*.md (architecture issues)
    └─ REQUIREMENTS-REVIEW-*.md (coverage gaps)
    ↓ provides review feedback for
Development Agent (v2) ← if issues found, iterates on fixes
    OR
Test Agent → docs/testing/ (test plans and cases)
    ↓ provides test results for
Team (approval/merge/deploy)
    ↓
    Complete end-to-end workflow with quality gates
```

---



```
Agent Usage (Generic)
        ↓
    Reads from docs/reference/
        ↓
    Processes instructions (from .github/)
        ↓
    Generates output
        ↓
    Saves to docs/[output-folder]/
        ↓
    Other agents reference docs/
        ↓
    Build comprehensive system
```

---

## 📋 How Each Layer Works

### Layer 1: `.github/agents/` (Generic Agent Definitions)

**What it contains:**
```markdown
# example.agent.md
---
name: example
description: "Use when: [generic use cases]"  ← No project name
---

## Role & Responsibility
The agent [does generic things]

## Output Location & Format
**Output Directory:** `docs/folder/`
**Input References:** 
- From: `docs/reference/`
- Guidelines: `docs/reference/guidelines/`
```

**Key principle:** Agent definitions never mention specific projects. They point to `docs/` structure instead.

---

### Layer 2: `.github/skills/` (Reusable Skill Implementations)

**What it contains:**
```markdown
# SKILL.md
---
name: example
description: "Use when: [generic capabilities]"  ← Framework, not project
---

## How to Use
/example [Your input]

Examples:  ← Generic examples, not project-specific
- /example Do generic thing
```

**Key principle:** Skill files contain reusable code and patterns, not project-specific examples.

---

### Layer 3: `docs/reference/` (Project Context)

**What it contains:**
- `docs/reference/requirements/` - Project requirements
- `docs/reference/guidelines/` - Team-specific conventions
- `docs/reference/templates/` - Customized templates for this project
- `docs/reference/examples/` - Project examples

**Purpose:** When agents need to understand project context, they reference materials here.

---

### Layer 4: `docs/[output-folder]/` (Agent Outputs)

**What it contains:**
- `docs/plans/` - Output from Plan Agent (project timeline, roadmaps)
- `docs/analysis/` - Output from SA Agent (requirements analysis, system analysis, flow diagrams)
- `docs/design/` - Output from SD Agent (architecture, components, APIs, database schemas, and embedded diagrams)
- `docs/implementation/` - Output from Development Agent (code records, integration guides)
- `docs/review/` - Output from Review Agent (code reviews, design reviews, requirements reviews)
- `docs/testing/` - Output from Test Agent (test plans, test cases)

**Purpose:** Where each agent saves its generated content.

**Diagram Strategy:** 
- ✅ All diagrams are **embedded within SA/SD output documents** using Mermaid.js format
- ✅ Diagram standards defined in `.github/skills/[agent]/assets/` (reusable across projects):
  - Framework standards: `.github/skills/reference/assets/DIAGRAM-STANDARDS.md`
  - SA diagram specs: `.github/skills/sa/assets/DIAGRAM-STANDARDS.md`
  - SD diagram specs: `.github/skills/sd/assets/DIAGRAM-STANDARDS.md`
- ✅ No separate `/diagrams/` folder
- ✅ Supported types: Architecture, Component, Data Flow, Sequence, State, Database/ER, Process Flows, Deployment

**Data Flow Between Agents:**
```
Plan Agent
    ↓ output → docs/plans/
SA Agent
    ↓ reads docs/plans/ as context
    ↓ output → docs/analysis/
SD Agent
    ↓ reads docs/analysis/ + docs/plans/ as context
    ↓ output → docs/design/
Development Agent
    ↓ reads docs/design/ as input
    ↓ output → docs/implementation/
Review Agent
    ↓ reads docs/implementation/ + docs/design/ as context
    ↓ output → docs/review/
Test Agent
    ↓ reads docs/plans/ + docs/design/ as context
    ↓ output → docs/testing/
```

---

## � Diagram Integration Pattern

All diagrams are **embedded directly within SA and SD output documents**, not stored in separate files.

### Why This Approach?

- ✅ **Unified Context:** Diagrams stay with their explanatory content
- ✅ **Single Source of Truth:** No sync issues between text and diagrams
- ✅ **Easier Maintenance:** Update documentation once, diagram updates with it
- ✅ **Version Control Friendly:** Markdown + diagrams tracked together
- ✅ **Framework Portable:** No external dependencies on image files

### Diagram Specification

**All diagrams use Mermaid.js format** with standardized definitions and templates in `.github/skills/[agent]/assets/`:

**Framework & Standards:**
- 📋 `.github/skills/reference/assets/DIAGRAM-STANDARDS.md` - Core framework (supported types, naming, styling)
- 📋 `.github/skills/sa/assets/DIAGRAM-STANDARDS.md` - SA agent specifications (sequence, process, state diagrams)
- 📋 `.github/skills/sd/assets/DIAGRAM-STANDARDS.md` - SD agent specifications (architecture, component, ER, deployment)

**Supported Diagram Types:**
| Type | Format | Used In | Defined In |
|------|--------|---------|------------|
| Architecture | Mermaid graph TD/LR | SD docs | `.github/skills/sd/` |
| Sequence/Flow | Mermaid sequenceDiagram | SA docs | `.github/skills/sa/` |
| Data Model | Mermaid erDiagram | SD docs | `.github/skills/sd/` |
| State Transitions | Mermaid stateDiagram | SA/SD docs | `.github/skills/sa/` or `.github/skills/sd/` |
| Process Flows | Mermaid flowchart | SA docs | `.github/skills/sa/` |
| Deployment | Mermaid graph TD | SD docs | `.github/skills/sd/` |

### Example: Embedded Diagram in SD Output

```markdown
# Component: Authentication Service

## Architecture

\`\`\`mermaid
graph TD
    A[Login API] --> B[Auth Service]
    B --> C[Token Manager]
    C --> D[JWT Store]
\`\`\`

## Database Schema

\`\`\`mermaid
erDiagram
    USERS ||--o{ SESSIONS : has
    USERS {
        int user_id PK
        string email
    }
\`\`\`
```

**Key Principle:** SA/SD agents generate markdown files that **include diagram definitions**, not image files.

---

## �🔀 Making This Reusable

### For Another Project

**Option 1: Copy the Framework**
```bash
# Copy just the .github/ folder
cp -r YourProject/.github/ NewProject/.github/

# NewProject has same agent/skill structure
# Create new docs/reference/ with your project context
# Everything else works automatically
```

**Option 2: Git Submodule (Shared Framework)**
```bash
# If multiple projects share same framework
git submodule add git@repo:org/agent-skill-framework .github
```

### Customization Points

When reusing `.github/` in a new project:

1. **Leave agents & skills unchanged** ← They're generic
2. **Customize `docs/reference/`** ← Your project context
3. **Create `docs/plans/`, `docs/analysis/`, etc.** ← For outputs
4. Update `.github/skills/[skill]/assets/` if you have custom templates

---

## 📝 Naming & Positioning Pattern

**Generic Framework Location:**
```
.github/agents/plan.agent.md         ← Never says "for Project X"
.github/skills/plan/SKILL.md         ← Describes what the skill does, generically
.github/skills/plan/assets/template.md  ← Reusable template structure
```

**Project Content Location:**
```
docs/reference/requirements/          ← Project requirements
docs/reference/guidelines/            ← Team conventions (optional)
docs/reference/templates/             ← Project-specific template examples
docs/plans/active/                    ← Where Plan Agent saves output
```

**Agent Instruction Pattern:**
```markdown
# In .github/agents/

Output Location: docs/[folder-name]/
- Generic folder structure
- No project-specific paths

Input References:
- From: docs/reference/
- Guidelines: docs/reference/guidelines/
```

---

## ✅ Checklist: Is Your `.github/` Truly Generic?

Use this to audit your framework:

- [ ] No project names in descriptions
- [ ] No project-specific examples in "How to Use"
- [ ] Output locations reference `docs/` generically
- [ ] Input references point to `docs/reference/`
- [ ] Guidelines referenced via `docs/reference/guidelines/`
- [ ] All concrete project content in `docs/` folder
- [ ] Framework would work for different project with different `docs/reference/`

---

## 🚀 Why This Matters

**Benefits:**

1. **Reusability** - Same `.github/` for multiple projects
2. **Maintainability** - Update framework in one place
3. **Clarity** - Clear separation of generic vs specific
4. **Scalability** - Can convert to shared package later
5. **Team Alignment** - Everyone knows where content belongs

**What You Can Do Now:**

- ✅ Copy `.github/` to a new project
- ✅ Share `.github/` as a template
- ✅ Document the framework in team wiki
- ✅ Train teams on the pattern

**What You Can Do Later:**

- 🔄 Convert to npm package: `@org/agent-framework`
- 🔄 Build company-wide agent registry
- 🔄 Create agent marketplace with versioning
- 🔄 Integrate with GitHub App for automatic setup

---

## 📚 Related Documentation

- [Agent Definitions](./agents/plan.agent.md)
- [Skill Implementations](./skills/plan/SKILL.md)
- [Documentation Hub](../docs/INDEX.md)
- [Reference Materials Structure](../docs/reference/README.md)
